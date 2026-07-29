"""
utils/math_utils.py
NDURANCE AI — Core Mathematical Utilities for Biomechanics
Angle calculations, vector math, midpoint computations.
"""
import math
import numpy as np
from typing import Optional, Dict, Any


def calculate_angle(
    a: Optional[Dict],
    b: Optional[Dict],
    c: Optional[Dict]
) -> Optional[float]:
    """
    Calculate the angle (in degrees) at point B formed by vectors BA and BC.
    Uses 3D landmark coordinates from MediaPipe.
    
    Args:
        a: {'x', 'y', 'z'} — first point
        b: {'x', 'y', 'z'} — vertex point (angle measured here)
        c: {'x', 'y', 'z'} — third point
    Returns:
        Angle in degrees, or None if any point is missing.
    """
    if not a or not b or not c:
        return None
    
    try:
        # Vectors from B to A and B to C
        ba = np.array([a['x'] - b['x'], a['y'] - b['y'], a.get('z', 0) - b.get('z', 0)])
        bc = np.array([c['x'] - b['x'], c['y'] - b['y'], c.get('z', 0) - b.get('z', 0)])
        
        # Cosine of angle via dot product
        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)
        
        if norm_ba == 0 or norm_bc == 0:
            return None
        
        cos_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
        cos_angle = np.clip(cos_angle, -1.0, 1.0)  # Numerical stability
        
        angle = math.degrees(math.acos(cos_angle))
        return round(angle, 2)
    except Exception:
        return None


def calculate_line_angle(
    p1: Optional[Dict],
    p2: Optional[Dict]
) -> Optional[float]:
    """
    Calculate the angle of the line connecting p1 to p2 relative to vertical (y-axis).
    Positive = tilted right, Negative = tilted left.
    """
    if not p1 or not p2:
        return None
    
    try:
        dx = p2['x'] - p1['x']
        dy = p2['y'] - p1['y']
        angle = math.degrees(math.atan2(dx, dy))
        return round(angle, 2)
    except Exception:
        return None


def midpoint(
    p1: Optional[Dict],
    p2: Optional[Dict]
) -> Optional[Dict]:
    """Return the 3D midpoint between two landmarks."""
    if not p1 or not p2:
        return None
    return {
        'x': (p1['x'] + p2['x']) / 2,
        'y': (p1['y'] + p2['y']) / 2,
        'z': (p1.get('z', 0) + p2.get('z', 0)) / 2,
    }


def euclidean_distance_2d(p1: Optional[Dict], p2: Optional[Dict]) -> Optional[float]:
    """2D Euclidean distance between two normalized landmark points."""
    if not p1 or not p2:
        return None
    return math.sqrt((p1['x'] - p2['x']) ** 2 + (p1['y'] - p2['y']) ** 2)


def euclidean_distance_3d(p1: Optional[Dict], p2: Optional[Dict]) -> Optional[float]:
    """3D Euclidean distance between two landmarks."""
    if not p1 or not p2:
        return None
    return math.sqrt(
        (p1['x'] - p2['x']) ** 2 +
        (p1['y'] - p2['y']) ** 2 +
        (p1.get('z', 0) - p2.get('z', 0)) ** 2
    )


def smooth_value(history: list, current: float, window: int = 5) -> float:
    """Simple moving average smoothing for noisy landmark values."""
    history.append(current)
    if len(history) > window:
        history.pop(0)
    return sum(history) / len(history)


def normalize_score(value: float, low: float, high: float, invert: bool = False) -> float:
    """
    Normalize a metric value to a 0-100 score.
    
    Args:
        value: The raw metric value
        low: Lower bound of acceptable range
        high: Upper bound of acceptable range
        invert: If True, higher values = worse score (e.g., ground contact time)
    """
    if high == low:
        return 100.0
    
    # Distance from optimal center
    center = (low + high) / 2
    half_range = (high - low) / 2
    
    deviation = abs(value - center)
    score = max(0.0, 100.0 - (deviation / half_range) * 50.0)
    
    if invert:
        score = 100.0 - score
    
    return round(score, 1)
