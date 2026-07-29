"""
core/pose_engine.py
NDURANCE AI — MediaPipe Pose Processing Engine
Handles single-frame landmark extraction and skeleton drawing.
"""
from typing import Optional, List, Dict, Any, Tuple
import numpy as np

# ── MediaPipe landmark indices ──────────────────────────────────────────
LANDMARK_IDS = {
    "nose": 0,
    "left_eye_inner": 1, "left_eye": 2, "left_eye_outer": 3,
    "right_eye_inner": 4, "right_eye": 5, "right_eye_outer": 6,
    "left_ear": 7, "right_ear": 8,
    "mouth_left": 9, "mouth_right": 10,
    "left_shoulder": 11, "right_shoulder": 12,
    "left_elbow": 13, "right_elbow": 14,
    "left_wrist": 15, "right_wrist": 16,
    "left_pinky": 17, "right_pinky": 18,
    "left_index": 19, "right_index": 20,
    "left_thumb": 21, "right_thumb": 22,
    "left_hip": 23, "right_hip": 24,
    "left_knee": 25, "right_knee": 26,
    "left_ankle": 27, "right_ankle": 28,
    "left_heel": 29, "right_heel": 30,
    "left_foot_index": 31, "right_foot_index": 32,
}

# ── Skeleton connections for drawing ────────────────────────────────────
SKELETON_CONNECTIONS = [
    # Face
    (0, 7), (0, 8),  # Nose to ears
    # Torso
    (11, 12), (11, 23), (12, 24), (23, 24),
    # Left arm
    (11, 13), (13, 15), (15, 17), (15, 19),
    # Right arm
    (12, 14), (14, 16), (16, 18), (16, 20),
    # Left leg
    (23, 25), (25, 27), (27, 29), (27, 31),
    # Right leg
    (24, 26), (26, 28), (28, 30), (28, 32),
]

# Primary joints for display labels
PRIMARY_JOINTS = [
    "nose", "left_shoulder", "right_shoulder",
    "left_elbow", "right_elbow",
    "left_hip", "right_hip",
    "left_knee", "right_knee",
    "left_ankle", "right_ankle",
]

try:
    import mediapipe as mp
    import cv2

    try:
        mp_pose = mp.solutions.pose
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing_styles = mp.solutions.drawing_styles
        MEDIAPIPE_AVAILABLE = True
    except Exception:
        # Newer MediaPipe releases may not expose the legacy mp.solutions API.
        MEDIAPIPE_AVAILABLE = False
        mp_pose = None
        mp_drawing = None
        mp_drawing_styles = None
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    mp_pose = None
    mp_drawing = None
    mp_drawing_styles = None


class PoseEngine:
    """
    Wraps MediaPipe Pose for single-instance reuse.
    Thread-unsafe — create one instance per camera stream.
    """

    def __init__(
        self,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
        model_complexity: int = 1,
    ):
        self.available = MEDIAPIPE_AVAILABLE
        self._frame_count = 0
        self._fps_history: List[float] = []

        if self.available:
            self.pose = mp_pose.Pose(
                static_image_mode=False,
                model_complexity=model_complexity,
                smooth_landmarks=True,
                min_detection_confidence=min_detection_confidence,
                min_tracking_confidence=min_tracking_confidence,
            )
        else:
            self.pose = None

    def process_frame(
        self,
        frame_bgr: np.ndarray
    ) -> Tuple[Optional[List[Dict]], np.ndarray]:
        """
        Process a single BGR frame through MediaPipe Pose.
        
        Returns:
            landmarks: List of 33 dicts with {x, y, z, visibility}, or None
            annotated_frame: BGR frame with skeleton drawn
        """
        if not self.available or self.pose is None:
            return None, frame_bgr

        image_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False
        results = self.pose.process(image_rgb)
        image_rgb.flags.writeable = True

        annotated = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        if not results.pose_landmarks:
            return None, annotated

        # Extract landmarks
        landmarks = []
        for lm in results.pose_landmarks.landmark:
            landmarks.append({
                "x": round(lm.x, 5),
                "y": round(lm.y, 5),
                "z": round(lm.z, 5),
                "visibility": round(lm.visibility, 3),
            })

        # Draw skeleton with NDURANCE colors
        self._draw_skeleton(annotated, results.pose_landmarks, frame_bgr.shape)
        
        self._frame_count += 1
        return landmarks, annotated

    def _draw_skeleton(
        self,
        frame: np.ndarray,
        pose_landmarks,
        shape: Tuple
    ):
        """Draw skeleton with cyan/purple NDURANCE color scheme."""
        import cv2 as _cv2

        h, w = shape[:2]
        lm = pose_landmarks.landmark

        def pt(idx) -> Tuple[int, int]:
            return (int(lm[idx].x * w), int(lm[idx].y * h))

        # Draw connections
        for (a, b) in SKELETON_CONNECTIONS:
            if lm[a].visibility > 0.4 and lm[b].visibility > 0.4:
                _cv2.line(frame, pt(a), pt(b), (0, 220, 255), 2, _cv2.LINE_AA)

        # Draw joint circles
        for name in PRIMARY_JOINTS:
            idx = LANDMARK_IDS[name]
            if lm[idx].visibility > 0.5:
                x, y = pt(idx)
                # Outer glow ring
                _cv2.circle(frame, (x, y), 8, (0, 160, 200), 1, _cv2.LINE_AA)
                # Filled dot
                _cv2.circle(frame, (x, y), 5, (0, 229, 255), -1, _cv2.LINE_AA)
                # Label
                label = name.replace("_", " ").replace("left ", "L.").replace("right ", "R.")
                _cv2.putText(
                    frame, label.title(),
                    (x + 8, y - 4),
                    _cv2.FONT_HERSHEY_SIMPLEX, 0.28,
                    (180, 255, 230), 1, _cv2.LINE_AA
                )

    def close(self):
        """Release MediaPipe resources."""
        if self.pose:
            self.pose.close()

    def __del__(self):
        self.close()


def frame_to_jpeg_bytes(frame: np.ndarray, quality: int = 75) -> bytes:
    """Encode a numpy BGR frame as JPEG bytes for WebSocket streaming."""
    import cv2
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
    return buffer.tobytes()


def draw_fps_overlay(frame: np.ndarray, fps: float, camera_label: str, health: str = "OK"):
    """Overlay FPS counter and camera health indicator on frame."""
    import cv2
    h, w = frame.shape[:2]
    
    # Semi-transparent top bar
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 30), (10, 10, 20), -1)
    cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
    
    # Camera label
    cv2.putText(frame, camera_label, (8, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)
    
    # FPS counter
    fps_text = f"{fps:.0f} FPS"
    cv2.putText(frame, fps_text, (w - 70, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 229, 255), 1, cv2.LINE_AA)
    
    # Health dot
    color = (0, 220, 100) if health == "OK" else (0, 100, 255)
    cv2.circle(frame, (w - 90, 15), 5, color, -1)
