"""
core/kinematics.py
NDURANCE AI — Full-Body Joint Angle & Biomechanics Engine
Computes all primary joint angles and body alignment metrics.
"""
from typing import Optional, List, Dict, Any
from app.utils.math_utils import (
    calculate_angle, calculate_line_angle,
    midpoint, euclidean_distance_2d
)


# ── MediaPipe Landmark Indices ───────────────────────────────────────────
NOSE = 0
LEFT_EYE = 2; RIGHT_EYE = 5
LEFT_EAR = 7; RIGHT_EAR = 8
LEFT_SHOULDER = 11; RIGHT_SHOULDER = 12
LEFT_ELBOW = 13; RIGHT_ELBOW = 14
LEFT_WRIST = 15; RIGHT_WRIST = 16
LEFT_HIP = 23; RIGHT_HIP = 24
LEFT_KNEE = 25; RIGHT_KNEE = 26
LEFT_ANKLE = 27; RIGHT_ANKLE = 28
LEFT_HEEL = 29; RIGHT_HEEL = 30
LEFT_FOOT = 31; RIGHT_FOOT = 32


def get_lm(landmarks: List[Dict], idx: int, min_visibility: float = 0.3) -> Optional[Dict]:
    """Safe landmark accessor with visibility check."""
    if idx >= len(landmarks):
        return None
    lm = landmarks[idx]
    if lm.get('visibility', 1.0) < min_visibility:
        return None
    return lm


def compute_all_joint_angles(landmarks: List[Dict]) -> Dict[str, Any]:
    """
    Compute all relevant joint angles from a single frame of 33 MediaPipe landmarks.
    
    Returns a comprehensive dict of angles and alignment values.
    """
    if not landmarks or len(landmarks) < 33:
        return {}

    g = lambda idx: get_lm(landmarks, idx)

    # ── Shoulder midpoint ──────────────────────────────────────────────
    l_sh = g(LEFT_SHOULDER); r_sh = g(RIGHT_SHOULDER)
    l_hip = g(LEFT_HIP); r_hip = g(RIGHT_HIP)
    l_knee = g(LEFT_KNEE); r_knee = g(RIGHT_KNEE)
    l_ank = g(LEFT_ANKLE); r_ank = g(RIGHT_ANKLE)
    l_foot = g(LEFT_FOOT); r_foot = g(RIGHT_FOOT)
    l_elbow = g(LEFT_ELBOW); r_elbow = g(RIGHT_ELBOW)
    l_wrist = g(LEFT_WRIST); r_wrist = g(RIGHT_WRIST)
    l_heel = g(LEFT_HEEL); r_heel = g(RIGHT_HEEL)
    nose = g(NOSE)
    l_ear = g(LEFT_EAR); r_ear = g(RIGHT_EAR)

    sh_center = midpoint(l_sh, r_sh)
    hip_center = midpoint(l_hip, r_hip)
    ear_center = midpoint(l_ear, r_ear)

    # ── Joint Angles ───────────────────────────────────────────────────
    angles = {
        # Elbow angles
        "left_elbow": calculate_angle(l_sh, l_elbow, l_wrist),
        "right_elbow": calculate_angle(r_sh, r_elbow, r_wrist),

        # Shoulder angles (arm raise)
        "left_shoulder": calculate_angle(l_elbow, l_sh, l_hip),
        "right_shoulder": calculate_angle(r_elbow, r_sh, r_hip),

        # Hip angles
        "left_hip": calculate_angle(l_sh, l_hip, l_knee),
        "right_hip": calculate_angle(r_sh, r_hip, r_knee),

        # Knee angles
        "left_knee": calculate_angle(l_hip, l_knee, l_ank),
        "right_knee": calculate_angle(r_hip, r_knee, r_ank),

        # Ankle angles (dorsiflexion proxy)
        "left_ankle": calculate_angle(l_knee, l_ank, l_foot),
        "right_ankle": calculate_angle(r_knee, r_ank, r_foot),

        # Trunk / spine
        "spine_inclination": calculate_line_angle(sh_center, hip_center),
        "shoulder_alignment": calculate_line_angle(l_sh, r_sh),
        "hip_alignment": calculate_line_angle(l_hip, r_hip),

        # Neck / head alignment
        "neck_angle": calculate_line_angle(nose or ear_center, sh_center),

        # Knee varus/valgus proxy (medial-lateral deviation)
        "left_knee_valgus": _knee_valgus(l_hip, l_knee, l_ank),
        "right_knee_valgus": _knee_valgus(r_hip, r_knee, r_ank),
    }

    # Asymmetry index between left and right sides
    angles["knee_asymmetry"] = _asymmetry(
        angles.get("left_knee"), angles.get("right_knee")
    )
    angles["hip_asymmetry"] = _asymmetry(
        angles.get("left_hip"), angles.get("right_hip")
    )

    # Remove None values for clean output
    return {k: v for k, v in angles.items() if v is not None}


def _knee_valgus(hip: Optional[Dict], knee: Optional[Dict], ankle: Optional[Dict]) -> Optional[float]:
    """
    Estimate knee valgus (inward collapse) using the lateral deviation
    of the knee from the hip-ankle line. Positive = valgus (inward).
    """
    if not all([hip, knee, ankle]):
        return None
    
    # X-axis projection: how far the knee deviates medially
    # Using normalized coordinates, knee should be between hip and ankle X
    hip_ank_center_x = (hip['x'] + ankle['x']) / 2
    deviation = knee['x'] - hip_ank_center_x
    
    # Scale to degrees-like value for consistency
    return round(deviation * 100, 2)  # percent of frame width deviation


def _asymmetry(left: Optional[float], right: Optional[float]) -> Optional[float]:
    """Calculate bilateral asymmetry index as a percentage."""
    if left is None or right is None:
        return None
    avg = (left + right) / 2
    if avg == 0:
        return 0.0
    return round(abs(left - right) / avg * 100, 2)


def compute_form_score(angles: Dict[str, Any], activity: str = "standing") -> float:
    """
    Compute an overall form score (0–100) based on joint angle deviations
    from biomechanical optimal ranges per activity.
    """
    score = 100.0
    deductions = []

    # ── Spine alignment ──────────────────────────────────────────────
    spine = angles.get("spine_inclination")
    if spine is not None:
        if abs(spine) > 15:
            deductions.append(min(20, abs(spine) - 15) * 0.8)

    # ── Neck / head forward ─────────────────────────────────────────
    neck = angles.get("neck_angle")
    if neck is not None and abs(neck) > 20:
        deductions.append(min(15, (abs(neck) - 20)) * 0.5)

    # ── Shoulder level ──────────────────────────────────────────────
    sh_align = angles.get("shoulder_alignment")
    if sh_align is not None and abs(sh_align) > 8:
        deductions.append(min(10, abs(sh_align) - 8))

    # ── Hip level ───────────────────────────────────────────────────
    hip_align = angles.get("hip_alignment")
    if hip_align is not None and abs(hip_align) > 8:
        deductions.append(min(10, abs(hip_align) - 8))

    # ── Asymmetry ───────────────────────────────────────────────────
    knee_asym = angles.get("knee_asymmetry")
    if knee_asym is not None and knee_asym > 5:
        deductions.append(min(15, knee_asym - 5))

    # ── Activity-specific scoring ───────────────────────────────────
    if activity == "squat":
        l_knee = angles.get("left_knee", 180)
        r_knee = angles.get("right_knee", 180)
        avg_knee = (l_knee + r_knee) / 2
        # Optimal squat depth: 90-110 degrees at parallel
        if avg_knee > 130:
            deductions.append(10)  # Not deep enough
        
    if activity == "running":
        spine = angles.get("spine_inclination", 0)
        if abs(spine) > 10:
            deductions.append((abs(spine) - 10) * 0.5)

    total_deduction = sum(deductions)
    score = max(0.0, 100.0 - total_deduction)
    return round(score, 1)


def generate_posture_alerts(angles: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Generate real-time posture correction alerts from joint angle analysis.
    Returns list of alert dicts with severity, message, joint.
    """
    alerts = []

    spine = angles.get("spine_inclination")
    if spine is not None and abs(spine) > 15:
        alerts.append({
            "severity": "warning" if abs(spine) < 25 else "danger",
            "category": "posture",
            "joint": "spine",
            "message": "Straighten your spine — forward lean detected." if spine > 0 
                      else "Straighten your spine — backward lean detected.",
        })

    neck = angles.get("neck_angle")
    if neck is not None and abs(neck) > 20:
        alerts.append({
            "severity": "warning",
            "category": "posture",
            "joint": "neck",
            "message": "Lift your head — forward head posture detected. Keep chin neutral.",
        })

    sh_align = angles.get("shoulder_alignment")
    if sh_align is not None and abs(sh_align) > 10:
        side = "right" if sh_align > 0 else "left"
        alerts.append({
            "severity": "info",
            "category": "alignment",
            "joint": "shoulder",
            "message": f"Level your shoulders — {side} shoulder is elevated.",
        })

    hip_align = angles.get("hip_alignment")
    if hip_align is not None and abs(hip_align) > 10:
        side = "right" if hip_align > 0 else "left"
        alerts.append({
            "severity": "info",
            "category": "alignment",
            "joint": "hip",
            "message": f"Level your hips — {side} hip drop detected.",
        })

    # Knee valgus warning
    for side in ["left", "right"]:
        valgus = angles.get(f"{side}_knee_valgus")
        if valgus is not None and abs(valgus) > 8:
            alerts.append({
                "severity": "warning",
                "category": "alignment",
                "joint": f"{side}_knee",
                "message": f"Watch your {side} knee — inward collapse (valgus) detected.",
            })

    return alerts
