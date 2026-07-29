"""
routers/live.py
NDURANCE AI — Live Camera WebSocket Analysis Endpoint
Supports 3 simultaneous camera streams via WebSocket.
Streams annotated frames back to frontend in real-time.
"""
import asyncio
import base64
import json
import time
from typing import Dict, Optional
import numpy as np

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi.websockets import WebSocketState

from app.core.pose_engine import PoseEngine, frame_to_jpeg_bytes, draw_fps_overlay
from app.core.activity_detector import ActivityDetector
from app.core.kinematics import compute_all_joint_angles, compute_form_score, generate_posture_alerts
from app.core.gait_analyzer import GaitAnalyzer
from app.core.exercise_analyzer import ExerciseAnalyzer
from app.ai.gemini_client import generate_live_coaching_cue

router = APIRouter(prefix="/ws", tags=["Live Analysis"])

# ── Camera label mapping ──────────────────────────────────────────────────
CAMERA_LABELS = {
    "left": "LEFT CAM",
    "back": "BACK CAM",
    "right": "RIGHT CAM",
}


class CameraSession:
    """
    Per-camera analysis state. Each WebSocket connection gets its own instance.
    """

    def __init__(self, camera_id: str, height_cm: float = 175.0, fps: float = 30.0):
        self.camera_id = camera_id
        self.label = CAMERA_LABELS.get(camera_id, camera_id.upper())
        self.pose = PoseEngine(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.activity_detector = ActivityDetector(window_size=15)
        self.gait_analyzer = GaitAnalyzer(fps=fps, height_cm=height_cm)
        self.exercise_analyzer = ExerciseAnalyzer()

        self._frame_count = 0
        self._fps_counter = 0
        self._fps_start = time.time()
        self._current_fps = 0.0
        self._coach_cues: list = []
        self._last_cue_time = 0.0
        self._cue_cooldown = 3.0  # Seconds between AI cue generation

    def process_frame(self, frame_bytes: bytes) -> Dict:
        """
        Process a raw JPEG frame and return full analysis packet.
        """
        try:
            import cv2
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                return {"error": "Invalid frame data"}

            self._frame_count += 1
            self._fps_counter += 1

            # Update FPS every second
            now = time.time()
            elapsed = now - self._fps_start
            if elapsed >= 1.0:
                self._current_fps = self._fps_counter / elapsed
                self._fps_counter = 0
                self._fps_start = now

            # ── MediaPipe Pose ────────────────────────────────────────
            landmarks, annotated_frame = self.pose.process_frame(frame)

            # ── Draw overlay ──────────────────────────────────────────
            draw_fps_overlay(annotated_frame, self._current_fps, self.label)

            # Encode annotated frame to JPEG base64
            annotated_jpeg = frame_to_jpeg_bytes(annotated_frame, quality=70)
            frame_b64 = base64.b64encode(annotated_jpeg).decode('utf-8')

            if not landmarks:
                return {
                    "frame": frame_b64,
                    "camera": self.camera_id,
                    "fps": round(self._current_fps, 1),
                    "landmarks": None,
                    "activity": "no_person",
                    "confidence": 0.0,
                    "joint_angles": {},
                    "form_score": 0.0,
                    "alerts": [],
                    "gait_metrics": None,
                    "exercise_data": None,
                    "coach_cue": None,
                }

            # ── Activity Detection ────────────────────────────────────
            activity, confidence = self.activity_detector.classify(landmarks)

            # ── Joint Angles ──────────────────────────────────────────
            joint_angles = compute_all_joint_angles(landmarks)

            # ── Form Score ────────────────────────────────────────────
            form_score = compute_form_score(joint_angles, activity)

            # ── Posture Alerts ────────────────────────────────────────
            alerts = generate_posture_alerts(joint_angles)

            # ── Gait Analysis (for walking/running) ───────────────────
            gait_metrics = None
            if activity in ("walking", "running"):
                gait_metrics = self.gait_analyzer.update(landmarks)

            # ── Exercise Analysis ─────────────────────────────────────
            exercise_data = None
            if activity in ("squat", "pushup", "lunge", "jump"):
                exercise_data = self.exercise_analyzer.update(landmarks, activity)

            # ── Live AI Coach Cue (throttled) ─────────────────────────
            coach_cue = None
            if now - self._last_cue_time > self._cue_cooldown and (alerts or form_score < 85):
                coach_cue = generate_live_coaching_cue(
                    alerts=alerts,
                    activity=activity,
                    form_score=form_score,
                    previous_cues=self._coach_cues[-3:],
                )
                if coach_cue:
                    self._coach_cues.append(coach_cue)
                    self._last_cue_time = now

            # Serialize landmark data (subset for performance)
            lm_data = [
                {"x": lm["x"], "y": lm["y"], "z": lm["z"], "v": lm["visibility"]}
                for lm in landmarks
            ]

            return {
                "frame": frame_b64,
                "camera": self.camera_id,
                "fps": round(self._current_fps, 1),
                "frame_number": self._frame_count,
                "landmarks": lm_data,
                "activity": activity,
                "confidence": confidence,
                "joint_angles": joint_angles,
                "form_score": form_score,
                "alerts": alerts,
                "gait_metrics": gait_metrics,
                "exercise_data": exercise_data,
                "coach_cue": coach_cue,
            }

        except Exception as e:
            print(f"[LiveCamera {self.camera_id}] Frame processing error: {e}")
            return {"error": str(e), "camera": self.camera_id}

    def cleanup(self):
        self.pose.close()


# ── Active Sessions Registry ──────────────────────────────────────────────
_active_sessions: Dict[str, CameraSession] = {}


@router.websocket("/camera/{camera_id}")
async def camera_websocket(
    websocket: WebSocket,
    camera_id: str,
    height_cm: float = Query(default=175.0),
    fps: float = Query(default=30.0),
    user_id: Optional[str] = Query(default=None),
):
    """
    WebSocket endpoint for live camera analysis.
    
    Camera IDs: left | back | right
    
    Protocol:
    - Client sends: raw JPEG frame bytes OR JSON control messages
    - Server sends: JSON analysis packet with annotated frame + metrics
    """
    if camera_id not in ("left", "back", "right"):
        await websocket.close(code=1008, reason="Invalid camera_id. Use: left|back|right")
        return

    await websocket.accept()
    session_key = f"{user_id or 'anon'}_{camera_id}"
    session = CameraSession(camera_id=camera_id, height_cm=height_cm, fps=fps)
    _active_sessions[session_key] = session

    print(f"[WebSocket] Camera '{camera_id}' connected. User: {user_id or 'anonymous'}")

    try:
        await websocket.send_json({
            "type": "connected",
            "camera": camera_id,
            "message": f"NDURANCE AI — {CAMERA_LABELS[camera_id]} ready",
        })

        while True:
            # Receive frame data from client
            data = await websocket.receive()

            if "bytes" in data and data["bytes"]:
                # Binary frame data (JPEG bytes)
                frame_bytes = data["bytes"]
                result = session.process_frame(frame_bytes)
                result["type"] = "analysis"
                
                await websocket.send_json(result)

            elif "text" in data and data["text"]:
                # JSON control message
                try:
                    msg = json.loads(data["text"])
                    msg_type = msg.get("type", "")

                    if msg_type == "ping":
                        await websocket.send_json({"type": "pong", "camera": camera_id})
                    
                    elif msg_type == "config":
                        # Update session config
                        if "height_cm" in msg:
                            session.gait_analyzer.height_cm = msg["height_cm"]
                        await websocket.send_json({"type": "config_ack"})

                except json.JSONDecodeError:
                    pass

    except WebSocketDisconnect:
        print(f"[WebSocket] Camera '{camera_id}' disconnected.")
    except Exception as e:
        print(f"[WebSocket] Camera '{camera_id}' error: {e}")
    finally:
        session.cleanup()
        _active_sessions.pop(session_key, None)


@router.websocket("/session")
async def session_aggregate_websocket(
    websocket: WebSocket,
    user_id: Optional[str] = Query(default=None),
):
    """
    Aggregate session WebSocket — receives data from all cameras
    and provides unified session-level metrics and scoring.
    """
    await websocket.accept()

    try:
        await websocket.send_json({
            "type": "session_ready",
            "message": "NDURANCE AI session monitoring active",
        })

        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            # Aggregate multi-camera data into session summary
            if msg.get("type") == "camera_data":
                cameras = msg.get("cameras", {})
                
                # Compute session-level aggregate
                scores = [c.get("form_score", 0) for c in cameras.values() if c.get("form_score")]
                avg_score = sum(scores) / len(scores) if scores else 0

                activities = [c.get("activity") for c in cameras.values() if c.get("activity")]
                from collections import Counter
                primary_activity = Counter(activities).most_common(1)[0][0] if activities else "unknown"

                all_alerts = []
                for cam_data in cameras.values():
                    all_alerts.extend(cam_data.get("alerts", []))

                await websocket.send_json({
                    "type": "session_update",
                    "overall_score": round(avg_score, 1),
                    "primary_activity": primary_activity,
                    "alert_count": len(all_alerts),
                    "top_alerts": all_alerts[:3],
                })

    except WebSocketDisconnect:
        print("[Session WS] Disconnected.")
    except Exception as e:
        print(f"[Session WS] Error: {e}")
