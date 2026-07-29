"""
core/exercise_analyzer.py
NDURANCE AI — Exercise Form Analyzer
Rep counting + form scoring for: Squat, Push-up, Lunge, Jump
"""
from typing import List, Dict, Any, Optional
from collections import deque
from app.utils.math_utils import calculate_angle, midpoint


class ExerciseAnalyzer:
    """
    Stateful exercise rep counter and form scorer.
    Supports squat, pushup, lunge, and jump exercises.
    """

    def __init__(self):
        self._squat = RepCounter(up_threshold=160, down_threshold=120, name="squat")
        self._pushup = RepCounter(up_threshold=160, down_threshold=90, name="pushup")
        self._lunge = RepCounter(up_threshold=155, down_threshold=110, name="lunge")
        self._jump = RepCounter(up_threshold=170, down_threshold=145, name="jump")
        self._form_scores: deque = deque(maxlen=30)

    def update(self, landmarks: List[Dict], activity: str) -> Dict[str, Any]:
        """Process a frame for the given detected activity."""
        if not landmarks or len(landmarks) < 33:
            return self._empty()

        def get(idx: int) -> Optional[Dict]:
            lm = landmarks[idx]
            return lm if lm.get('visibility', 0) > 0.3 else None

        l_hip = get(23); r_hip = get(24)
        l_knee = get(25); r_knee = get(26)
        l_ankle = get(27); r_ankle = get(28)
        l_sh = get(11); r_sh = get(12)
        l_elbow = get(13); r_elbow = get(14)
        l_wrist = get(15); r_wrist = get(16)

        result = {"activity": activity, "reps": 0, "form_score": 85.0, "cues": []}

        if activity == "squat":
            l_knee_ang = calculate_angle(l_hip, l_knee, l_ankle)
            r_knee_ang = calculate_angle(r_hip, r_knee, r_ankle)
            avg_knee = self._avg([l_knee_ang, r_knee_ang])
            
            if avg_knee:
                reps = self._squat.update(avg_knee)
                form, cues = self._score_squat(avg_knee, l_knee_ang, r_knee_ang, l_hip, r_hip, l_sh, r_sh)
                result.update({"reps": reps, "form_score": form, "cues": cues,
                               "angle_display": f"Knee: {avg_knee:.0f}°"})

        elif activity == "pushup":
            l_elbow_ang = calculate_angle(l_sh, l_elbow, l_wrist)
            r_elbow_ang = calculate_angle(r_sh, r_elbow, r_wrist)
            avg_elbow = self._avg([l_elbow_ang, r_elbow_ang])
            
            if avg_elbow:
                reps = self._pushup.update(avg_elbow)
                form, cues = self._score_pushup(avg_elbow, l_sh, r_sh, l_hip, r_hip)
                result.update({"reps": reps, "form_score": form, "cues": cues,
                               "angle_display": f"Elbow: {avg_elbow:.0f}°"})

        elif activity == "lunge":
            l_knee_ang = calculate_angle(l_hip, l_knee, l_ankle)
            r_knee_ang = calculate_angle(r_hip, r_knee, r_ankle)
            front_knee = min([a for a in [l_knee_ang, r_knee_ang] if a] or [180])
            
            reps = self._lunge.update(front_knee)
            form, cues = self._score_lunge(front_knee, l_knee_ang, r_knee_ang)
            result.update({"reps": reps, "form_score": form, "cues": cues,
                           "angle_display": f"Front Knee: {front_knee:.0f}°"})

        elif activity == "jump":
            hip_center = midpoint(l_hip, r_hip)
            hip_y = hip_center['y'] if hip_center else 0.5
            # Map hip Y (0=top, 1=bottom) to pseudo angle for rep counter
            pseudo_angle = hip_y * 180
            
            reps = self._jump.update(pseudo_angle)
            result.update({"reps": reps, "form_score": 88.0, "cues": [],
                           "angle_display": "Jump detected"})

        self._form_scores.append(result["form_score"])
        result["avg_form_score"] = round(
            sum(self._form_scores) / len(self._form_scores), 1
        )
        return result

    def _score_squat(self, avg_knee, l_knee, r_knee, l_hip, r_hip, l_sh, r_sh):
        """Score squat form and generate cues."""
        score = 100.0
        cues = []

        # Depth check
        if avg_knee > 135:
            score -= 20
            cues.append("Squat deeper — aim for parallel (90-110°)")
        elif avg_knee > 120:
            score -= 8

        # Asymmetry
        if l_knee and r_knee:
            diff = abs(l_knee - r_knee)
            if diff > 15:
                score -= 10
                cues.append("Even out both knees — left/right imbalance detected")

        # Hip hinge (check if hips are back)
        if l_hip and r_hip and l_sh and r_sh:
            sh_center = midpoint(l_sh, r_sh)
            hip_center = midpoint(l_hip, r_hip)
            if sh_center and hip_center:
                if hip_center['y'] < sh_center['y'] - 0.05:
                    pass  # Good hip hinge
                else:
                    cues.append("Push hips back more — sit into the squat")

        return max(0, score), cues

    def _score_pushup(self, avg_elbow, l_sh, r_sh, l_hip, r_hip):
        """Score push-up form."""
        score = 100.0
        cues = []

        if avg_elbow > 160:
            cues.append("Lower your chest closer to the ground")
            score -= 15
        elif avg_elbow < 80:
            score -= 5  # Too low (ok for advanced)

        # Body alignment (check hips not sagging or piking)
        if l_sh and r_sh and l_hip and r_hip:
            sh_y = ((l_sh['y'] + r_sh['y']) / 2)
            hip_y = ((l_hip['y'] + r_hip['y']) / 2)
            diff = abs(sh_y - hip_y)
            if diff > 0.15:
                score -= 12
                cues.append("Keep your body in a straight plank line")

        return max(0, score), cues

    def _score_lunge(self, front_knee, l_knee, r_knee):
        """Score lunge form."""
        score = 100.0
        cues = []

        if front_knee > 135:
            score -= 20
            cues.append("Step further forward — front knee should reach 90°")
        elif front_knee < 80:
            score -= 8
            cues.append("Don't let front knee go past your toes")

        if l_knee and r_knee:
            diff = abs(l_knee - r_knee)
            if diff < 20:
                cues.append("Increase lunge depth for better range of motion")

        return max(0, score), cues

    @staticmethod
    def _avg(vals: List[Optional[float]]) -> Optional[float]:
        filtered = [v for v in vals if v is not None]
        return sum(filtered) / len(filtered) if filtered else None

    @staticmethod
    def _empty() -> Dict[str, Any]:
        return {"activity": "unknown", "reps": 0, "form_score": 0.0,
                "cues": [], "avg_form_score": 0.0}


class RepCounter:
    """
    State machine for counting exercise repetitions.
    Tracks up/down phases based on joint angle threshold crossings.
    """

    def __init__(self, up_threshold: float, down_threshold: float, name: str = "exercise"):
        self.up_threshold = up_threshold
        self.down_threshold = down_threshold
        self.name = name
        self.count = 0
        self._state = "up"  # "up" | "down"

    def update(self, angle: float) -> int:
        """Update with current angle, return total rep count."""
        if self._state == "up" and angle < self.down_threshold:
            self._state = "down"
        elif self._state == "down" and angle > self.up_threshold:
            self._state = "up"
            self.count += 1
        return self.count

    def reset(self):
        self.count = 0
        self._state = "up"
