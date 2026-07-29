"""
routers/sessions.py
NDURANCE AI — Session Management Router
CRUD for analysis sessions, metrics, joint angles, history.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import desc

from app.database import get_db
from app.models import Session, Metric, JointAngle, Alert, AiSummary, Recommendation, ActivityType
from app.utils.jwt_handler import get_current_user_id
from app.ai.gemini_client import generate_session_summary, generate_recommendations

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])


class CreateSessionRequest(BaseModel):
    activity_type: str = "unknown"
    session_type: str = "live"  # live | upload
    camera_count: int = 3
    height_cm: Optional[float] = 175.0
    weight_kg: Optional[float] = 70.0


class FinalizeSessionRequest(BaseModel):
    session_id: str
    duration_seconds: float
    frames_analyzed: int
    joint_angles_summary: Optional[dict] = None
    gait_metrics: Optional[dict] = None
    exercise_data: Optional[dict] = None
    alerts: Optional[List[dict]] = None
    overall_score: float = 0.0
    activity_type: str = "unknown"


@router.post("/start")
def start_session(
    payload: CreateSessionRequest,
    user_id: str = Depends(get_current_user_id),
    db: DBSession = Depends(get_db),
):
    """Create and start a new analysis session."""
    session = Session(
        user_id=user_id,
        activity_type=payload.activity_type,
        session_type=payload.session_type,
        camera_count=payload.camera_count,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "message": "Session started.",
        "created_at": str(session.created_at),
    }


@router.post("/finalize")
def finalize_session(
    payload: FinalizeSessionRequest,
    user_id: str = Depends(get_current_user_id),
    db: DBSession = Depends(get_db),
):
    """Finalize a session — save all metrics, generate AI summary, recommendations."""
    session = db.query(Session).filter(
        Session.id == payload.session_id,
        Session.user_id == user_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Update session fields
    session.duration_seconds = payload.duration_seconds
    session.frames_analyzed = payload.frames_analyzed
    session.overall_score = payload.overall_score
    try:
        session.activity_type = ActivityType(payload.activity_type)
    except ValueError:
        session.activity_type = ActivityType.unknown

    # Save joint angle summary as metrics
    if payload.joint_angles_summary:
        for joint_name, angle_val in payload.joint_angles_summary.items():
            if isinstance(angle_val, (int, float)):
                db.add(Metric(
                    session_id=session.id,
                    metric_name=f"joint_{joint_name}",
                    value=float(angle_val),
                    unit="degrees",
                ))

    # Save gait metrics
    if payload.gait_metrics:
        for metric_name, val in payload.gait_metrics.items():
            if isinstance(val, (int, float)):
                db.add(Metric(
                    session_id=session.id,
                    metric_name=metric_name,
                    value=float(val),
                ))

    # Save alerts
    if payload.alerts:
        for alert_data in payload.alerts[:20]:  # Cap at 20
            db.add(Alert(
                session_id=session.id,
                severity=alert_data.get("severity", "warning"),
                category=alert_data.get("category"),
                message=alert_data.get("message", ""),
                joint=alert_data.get("joint"),
            ))

    db.flush()

    # Generate AI summary
    all_metrics = {
        **(payload.gait_metrics or {}),
        **(payload.exercise_data or {}),
        "form_score": payload.overall_score,
    }

    from app.models import User as UserModel
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    
    ai_text = generate_session_summary(
        metrics=all_metrics,
        activity=payload.activity_type,
        user_name=user.name if user else "Athlete",
        height_cm=float(user.height_cm) if user and user.height_cm else 175,
        weight_kg=float(user.weight_kg) if user and user.weight_kg else 70,
    )

    db.add(AiSummary(session_id=session.id, summary_text=ai_text))

    # Generate recommendations
    issues = [a["message"] for a in (payload.alerts or [])[:5]]
    recs_data = generate_recommendations(all_metrics, payload.activity_type, issues)

    for i, rec in enumerate(recs_data):
        db.add(Recommendation(
            session_id=session.id,
            category=rec.get("category", "general"),
            title=rec.get("title", "Exercise"),
            description=rec.get("description", ""),
            sets_reps=rec.get("sets_reps"),
            priority=rec.get("priority", i + 1),
        ))

    db.commit()

    return {
        "message": "Session finalized and saved.",
        "session_id": session.id,
        "ai_summary": ai_text,
        "recommendations_count": len(recs_data),
    }


@router.get("/history")
def get_session_history(
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0),
    user_id: str = Depends(get_current_user_id),
    db: DBSession = Depends(get_db),
):
    """Get paginated session history for the current user."""
    total = db.query(Session).filter(Session.user_id == user_id).count()

    sessions = (
        db.query(Session)
        .filter(Session.user_id == user_id)
        .order_by(desc(Session.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "sessions": [
            {
                "id": s.id,
                "activity_type": s.activity_type,
                "session_type": s.session_type,
                "duration_seconds": s.duration_seconds,
                "overall_score": s.overall_score,
                "frames_analyzed": s.frames_analyzed,
                "created_at": str(s.created_at),
            }
            for s in sessions
        ],
    }


@router.get("/{session_id}")
def get_session_detail(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: DBSession = Depends(get_db),
):
    """Get detailed data for a single session."""
    session = db.query(Session).filter(
        Session.id == session_id,
        Session.user_id == user_id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    return {
        "id": session.id,
        "activity_type": session.activity_type,
        "session_type": session.session_type,
        "duration_seconds": session.duration_seconds,
        "overall_score": session.overall_score,
        "frames_analyzed": session.frames_analyzed,
        "created_at": str(session.created_at),
        "metrics": [
            {
                "name": metric.metric_name,
                "value": metric.value,
                "unit": metric.unit,
                "status": metric.status,
            }
            for metric in session.metrics
        ],
        "alerts": [
            {
                "severity": alert.severity,
                "category": alert.category,
                "message": alert.message,
                "joint": alert.joint,
            }
            for alert in session.alerts
        ],
        "ai_summary": session.ai_summary.summary_text if session.ai_summary else None,
        "recommendations": [
            {
                "title": rec.title,
                "category": rec.category,
                "description": rec.description,
                "sets_reps": rec.sets_reps,
                "priority": rec.priority,
            }
            for rec in session.recommendations
        ],
    }


@router.delete("/{session_id}")
def delete_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: DBSession = Depends(get_db),
):
    """Delete a session and its analysis data."""
    session = db.query(Session).filter(
        Session.id == session_id,
        Session.user_id == user_id,
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    db.delete(session)
    db.commit()

    return {"message": "Session deleted successfully."}
