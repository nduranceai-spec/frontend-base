"""
core/gait_analyzer.py
NDURANCE AI — Gait & Running Metrics Analyzer
Computes: Cadence, Stride Length, Ground Contact Time,
Vertical Oscillation, Foot Strike Type, Step Symmetry.
"""
from typing import List, Dict, Any, Optional
from collections import deque
import math
import numpy as np
from app.utils.math_utils import euclidean_distance_2d, calculate_angle, midpoint


class GaitAnalyzer:
    """
    Temporal analyzer for gait and running metrics.
    Requires multiple consecutive frames to compute meaningful metrics.
    """

    def __init__(self, fps: float = 30.0, height_cm: float = 175.0):
        self.fps = fps
        self.height_cm = height_cm
        self._hip_y: deque = deque(maxlen=120)  # 4 seconds at 30fps
        self._ankle_y: deque = deque(maxlen=120)
        self._step_times: deque = deque(maxlen=30)
        self._frame_count = 0
        self._last_foot_contact: Optional[int] = None
        self._step_count = 0

    def update(self, landmarks: List[Dict]) -> Dict[str, Any]:
        """
        Process a new frame of landmarks and return updated gait metrics.
        """
        self._frame_count += 1

        if not landmarks or len(landmarks) < 33:
            return self._empty_metrics()

        def get(idx: int) -> Optional[Dict]:
            lm = landmarks[idx]
            return lm if lm.get('visibility', 0) > 0.3 else None

        l_hip = get(23); r_hip = get(24)
        l_knee = get(25); r_knee = get(26)
        l_ankle = get(27); r_ankle = get(28)
        l_heel = get(29); r_heel = get(30)
        l_foot = get(31); r_foot = get(32)
        l_sh = get(11); r_sh = get(12)

        hip_center = midpoint(l_hip, r_hip)
        ankle_avg_y = self._avg_y([l_ankle, r_ankle])
        heel_avg_y = self._avg_y([l_heel, r_heel])

        # Track hip Y for vertical oscillation
        if hip_center:
            self._hip_y.append(hip_center['y'])

        # Foot contact detection via heel/ankle Y position
        if heel_avg_y:
            self._ankle_y.append(heel_avg_y)
            step_detected = self._detect_step(heel_avg_y)
            if step_detected:
                self._step_times.append(self._frame_count)
                self._step_count += 1

        return self._compute_metrics(
            l_hip, r_hip, l_knee, r_knee, l_ankle, r_ankle,
            l_heel, r_heel, l_foot, r_foot, l_sh, r_sh
        )

    def _compute_metrics(self, l_hip, r_hip, l_knee, r_knee,
                          l_ankle, r_ankle, l_heel, r_heel,
                          l_foot, r_foot, l_sh, r_sh) -> Dict[str, Any]:
        """Calculate all gait metrics from current state."""

        # ── Cadence ─────────────────────────────────────────────────
        cadence = self._compute_cadence()

        # ── Vertical Oscillation ─────────────────────────────────────
        vertical_osc_cm = self._compute_vertical_oscillation()

        # ── Ground Contact Time ──────────────────────────────────────
        gct_ms = self._compute_gct()

        # ── Stride Length (normalized by height) ─────────────────────
        stride_length_m = self._estimate_stride_length(cadence)

        # ── Foot Strike Type ─────────────────────────────────────────
        foot_strike = self._classify_foot_strike(l_heel, r_heel, l_foot, r_foot, l_ankle, r_ankle)

        # ── Knee Flexion at Impact ────────────────────────────────────
        knee_impact = self._avg_val([
            calculate_angle(l_hip, l_knee, l_ankle),
            calculate_angle(r_hip, r_knee, r_ankle),
        ])

        # ── Hip Extension ─────────────────────────────────────────────
        l_hip_ext = calculate_angle(l_sh, l_hip, l_knee) if all([l_sh, l_hip, l_knee]) else None
        r_hip_ext = calculate_angle(r_sh, r_hip, r_knee) if all([r_sh, r_hip, r_knee]) else None
        hip_extension = 180 - (self._avg_val([l_hip_ext, r_hip_ext]) or 160)

        # ── Step Symmetry ─────────────────────────────────────────────
        step_symmetry = self._compute_symmetry(
            calculate_angle(l_hip, l_knee, l_ankle),
            calculate_angle(r_hip, r_knee, r_ankle)
        )

        # ── Form Score ────────────────────────────────────────────────
        form_score = self._compute_gait_score(
            cadence, vertical_osc_cm, gct_ms, step_symmetry
        )

        return {
            "cadence": round(cadence, 1),
            "vertical_oscillation_cm": round(vertical_osc_cm, 2),
            "ground_contact_time_ms": round(gct_ms, 0),
            "stride_length_m": round(stride_length_m, 2),
            "foot_strike_type": foot_strike,
            "knee_flexion_impact": round(knee_impact, 1) if knee_impact else 160.0,
            "hip_extension_deg": round(hip_extension, 1),
            "step_symmetry_pct": round(step_symmetry, 1),
            "step_count": self._step_count,
            "form_score": round(form_score, 1),
        }

    def _compute_cadence(self) -> float:
        """Steps per minute from detected step timestamps."""
        if len(self._step_times) < 4:
            return 0.0
        
        steps = list(self._step_times)[-10:]
        if len(steps) < 2:
            return 0.0
        
        intervals = [steps[i+1] - steps[i] for i in range(len(steps)-1)]
        avg_interval_frames = sum(intervals) / len(intervals)
        
        if avg_interval_frames == 0:
            return 0.0
        
        spm = (self.fps / avg_interval_frames) * 60
        return min(max(spm, 60), 240)  # Clamp to realistic range

    def _compute_vertical_oscillation(self) -> float:
        """CM of vertical bounce from hip Y trajectory."""
        if len(self._hip_y) < 10:
            return 7.0
        
        recent = list(self._hip_y)[-30:]
        amplitude = (max(recent) - min(recent))
        # Convert normalized units to cm (approximate for 175cm person)
        return amplitude * self.height_cm * 0.6

    def _compute_gct(self) -> float:
        """Estimated ground contact time in milliseconds."""
        if len(self._ankle_y) < 10:
            return 210.0
        
        recent = list(self._ankle_y)[-20:]
        # GCT approximated from ankle y stability window
        variance = np.var(recent)
        # Lower variance = more time on ground
        gct = 180 + (1.0 - min(variance * 1000, 1.0)) * 100
        return min(max(gct, 150), 350)

    def _estimate_stride_length(self, cadence: float) -> float:
        """Estimate stride length from cadence and height."""
        if cadence <= 0:
            return 0.0
        # Running stride length heuristic: height * 0.5 at 180spm
        stride = (self.height_cm / 100) * 0.5 * (180 / max(cadence, 60))
        return min(max(stride, 0.4), 2.0)

    def _classify_foot_strike(self, l_heel, r_heel, l_foot, r_foot, l_ankle, r_ankle) -> str:
        """
        Classify foot strike pattern: Heel | Midfoot | Forefoot.
        Uses heel vs foot index Y position relative to ankle.
        """
        scores = []
        for heel, foot, ankle in [(l_heel, l_foot, l_ankle), (r_heel, r_foot, r_ankle)]:
            if not all([heel, foot, ankle]):
                continue
            # If heel Y > foot Y → heel is lower → heel strike
            heel_to_ankle = heel['y'] - ankle['y']
            foot_to_ankle = foot['y'] - ankle['y']
            
            if heel_to_ankle > foot_to_ankle + 0.01:
                scores.append("heel")
            elif foot_to_ankle > heel_to_ankle + 0.01:
                scores.append("forefoot")
            else:
                scores.append("midfoot")

        if not scores:
            return "Midfoot Strike"
        
        from collections import Counter
        vote = Counter(scores).most_common(1)[0][0]
        return f"{vote.title()} Strike"

    def _compute_symmetry(self, l_val: Optional[float], r_val: Optional[float]) -> float:
        """Bilateral symmetry index (100% = perfect symmetry)."""
        if l_val is None or r_val is None:
            return 95.0
        avg = (l_val + r_val) / 2
        if avg == 0:
            return 100.0
        asymmetry = abs(l_val - r_val) / avg * 100
        return max(0.0, 100.0 - asymmetry)

    def _compute_gait_score(self, cadence, vert_osc, gct, symmetry) -> float:
        """Composite gait efficiency score 0-100."""
        score = 100.0
        
        # Cadence scoring (optimal: 170-185 spm)
        if cadence > 0:
            if cadence < 160: score -= 15
            elif cadence < 170: score -= 8
            elif cadence > 190: score -= 5
        
        # Vertical oscillation (optimal: 6-8.5 cm)
        if vert_osc > 9: score -= 10
        elif vert_osc > 10: score -= 18
        
        # GCT (optimal: 180-220ms)
        if gct > 230: score -= 8
        elif gct > 260: score -= 15
        
        # Symmetry bonus/penalty
        if symmetry < 90: score -= 10
        elif symmetry < 95: score -= 5
        
        return max(0, score)

    def _detect_step(self, current_heel_y: float) -> bool:
        """Simple step detection via ankle Y local minima (foot lift)."""
        if len(self._ankle_y) < 3:
            return False
        
        prev = list(self._ankle_y)[-3:]
        # A step is detected when ankle Y stops falling (foot lands)
        return prev[-2] < prev[-1] and prev[-2] < prev[0]

    def _avg_y(self, points: List[Optional[Dict]]) -> Optional[float]:
        vals = [p['y'] for p in points if p is not None]
        return sum(vals) / len(vals) if vals else None

    def _avg_val(self, vals: List[Optional[float]]) -> Optional[float]:
        filtered = [v for v in vals if v is not None]
        return sum(filtered) / len(filtered) if filtered else None

    def _empty_metrics(self) -> Dict[str, Any]:
        return {
            "cadence": 0.0, "vertical_oscillation_cm": 0.0,
            "ground_contact_time_ms": 0.0, "stride_length_m": 0.0,
            "foot_strike_type": "Unknown", "knee_flexion_impact": 0.0,
            "hip_extension_deg": 0.0, "step_symmetry_pct": 0.0,
            "step_count": 0, "form_score": 0.0,
        }
