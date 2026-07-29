"""
core/activity_detector.py
NDURANCE AI — Automatic Activity Classification Engine
Detects: Standing, Walking, Running, Squat, Push-up, Lunge, Jump
No manual selection required — purely landmark-driven rule engine.
"""
from typing import Optional, Dict, Any, List, Tuple
from collections import deque
from app.utils.math_utils import calculate_angle, euclidean_distance_2d, midpoint
import math


class ActivityDetector:
    """
    Rule-based activity classifier using MediaPipe pose landmarks.
    Uses a temporal window of frames for stable classification.
    """

    ACTIVITIES = [
        "standing", "walking", "running",
        "squat", "pushup", "lunge", "jump", "unknown"
    ]

    def __init__(self, window_size: int = 15):
        self.window_size = window_size
        self._history: deque = deque(maxlen=window_size)
        self._hip_y_history: deque = deque(maxlen=window_size)
        self._confidence_history: deque = deque(maxlen=window_size)

    def classify(
        self,
        landmarks: List[Dict],
        fps: float = 30.0
    ) -> Tuple[str, float]:
        """
        Classify the current activity from landmarks.
        
        Returns:
            (activity_name, confidence_0_to_1)
        """
        if not landmarks or len(landmarks) < 33:
            return "unknown", 0.0

        activity, confidence = self._classify_frame(landmarks)
        
        # Add to temporal window
        self._history.append(activity)
        self._confidence_history.append(confidence)

        # Smooth via majority vote
        if len(self._history) >= 5:
            from collections import Counter
            vote = Counter(self._history).most_common(1)[0]
            smoothed_activity = vote[0]
            smoothed_confidence = sum(self._confidence_history) / len(self._confidence_history)
            return smoothed_activity, round(smoothed_confidence, 2)

        return activity, confidence

    def _classify_frame(self, lm: List[Dict]) -> Tuple[str, float]:
        """Single-frame classification logic."""
        
        def get(idx: int) -> Optional[Dict]:
            return lm[idx] if idx < len(lm) and lm[idx].get('visibility', 0) > 0.3 else None

        nose = get(0)
        l_shoulder = get(11); r_shoulder = get(12)
        l_hip = get(23); r_hip = get(24)
        l_knee = get(25); r_knee = get(26)
        l_ankle = get(27); r_ankle = get(28)
        l_wrist = get(15); r_wrist = get(16)
        l_elbow = get(13); r_elbow = get(14)

        # ── Feature Extraction ────────────────────────────────────────
        
        # Left and right knee angles
        l_knee_angle = calculate_angle(l_hip, l_knee, l_ankle)
        r_knee_angle = calculate_angle(r_hip, r_knee, r_ankle)
        avg_knee = self._avg([l_knee_angle, r_knee_angle])

        # Hip center Y position (normalized 0=top, 1=bottom)
        hip_center = midpoint(l_hip, r_hip)
        hip_y = hip_center['y'] if hip_center else 0.5

        # Shoulder center Y
        shoulder_center = midpoint(l_shoulder, r_shoulder)
        shoulder_y = shoulder_center['y'] if shoulder_center else 0.3

        # Wrist height relative to shoulder
        avg_wrist_y = self._avg([
            l_wrist['y'] if l_wrist else None,
            r_wrist['y'] if r_wrist else None
        ])

        # Elbow angles (for pushup detection)
        l_elbow_angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
        r_elbow_angle = calculate_angle(r_shoulder, r_elbow, r_wrist)
        avg_elbow = self._avg([l_elbow_angle, r_elbow_angle])

        # Trunk inclination (spine angle from vertical)
        trunk_angle = None
        if shoulder_center and hip_center:
            dx = shoulder_center['x'] - hip_center['x']
            dy = shoulder_center['y'] - hip_center['y']
            trunk_angle = abs(math.degrees(math.atan2(dx, abs(dy))))

        # Hip height ratio (hip_y / shoulder_y) — higher ratio = more crouched
        hip_ratio = hip_y / shoulder_y if shoulder_y and shoulder_y > 0.05 else 1.0

        # Track hip Y for jump detection
        self._hip_y_history.append(hip_y)

        # ── Classification Rules ──────────────────────────────────────

        # PUSH-UP: highly horizontal trunk + low shoulder + elbows bent
        if trunk_angle is not None and trunk_angle > 60 and shoulder_y > 0.55:
            if avg_elbow and avg_elbow < 130:
                return "pushup", 0.85

        # SQUAT: deep knee flexion + upright trunk + symmetric
        if avg_knee and avg_knee < 130 and trunk_angle is not None and trunk_angle < 30:
            if hip_ratio > 1.2:
                return "squat", 0.88

        # LUNGE: asymmetric knee angles + one knee very bent
        if l_knee_angle and r_knee_angle:
            diff = abs(l_knee_angle - r_knee_angle)
            min_knee = min(l_knee_angle, r_knee_angle)
            if diff > 25 and min_knee < 130:
                return "lunge", 0.80

        # JUMP: rapid upward hip movement (hip_y dropping = body rising)
        if len(self._hip_y_history) >= 5:
            recent = list(self._hip_y_history)[-5:]
            hip_delta = max(recent) - min(recent)
            if hip_delta > 0.04 and hip_y < 0.45:
                return "jump", 0.75

        # RUNNING: fast cadence implied + high knee lift + low ground contact
        # Proxy: knee angles cycling rapidly with large range + high hip
        if avg_knee and avg_knee < 160 and hip_y < 0.55:
            if l_knee_angle and r_knee_angle:
                knee_diff = abs(l_knee_angle - r_knee_angle)
                if knee_diff > 20:
                    return "running", 0.72

        # WALKING: moderate knee flexion + vertical trunk
        if avg_knee and 145 < avg_knee < 175:
            if trunk_angle is not None and trunk_angle < 20:
                return "walking", 0.70

        # STANDING: nearly straight knees + upright trunk
        if avg_knee and avg_knee > 160:
            if trunk_angle is not None and trunk_angle < 15:
                return "standing", 0.82

        return "unknown", 0.45

    @staticmethod
    def _avg(values: List[Optional[float]]) -> Optional[float]:
        filtered = [v for v in values if v is not None]
        return sum(filtered) / len(filtered) if filtered else None
