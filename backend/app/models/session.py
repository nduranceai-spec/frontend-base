"""
models/session.py
NDURANCE AI — Session, Metric, JointAngle, Alert ORM Models
"""
from sqlalchemy import (
    Column, String, Float, Integer, Boolean,
    DateTime, ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base


class ActivityType(str, enum.Enum):
    standing = "standing"
    walking = "walking"
    running = "running"
    squat = "squat"
    pushup = "pushup"
    lunge = "lunge"
    jump = "jump"
    unknown = "unknown"


class Session(Base):
    """A single analysis session (can be live or video upload)."""
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    activity_type = Column(Enum(ActivityType), default=ActivityType.unknown)
    session_type = Column(String(20), default="live")  # live | upload
    camera_count = Column(Integer, default=3)
    duration_seconds = Column(Float, default=0.0)
    frames_analyzed = Column(Integer, default=0)
    overall_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="sessions")
    metrics = relationship("Metric", back_populates="session", cascade="all, delete-orphan")
    joint_angles = relationship("JointAngle", back_populates="session", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="session", cascade="all, delete-orphan")
    ai_summary = relationship("AiSummary", back_populates="session", uselist=False, cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="session", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="session", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Session {self.id} [{self.activity_type}]>"


class Metric(Base):
    """Time-series biomechanical metrics per session."""
    __tablename__ = "metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=True)
    unit = Column(String(30), nullable=True)
    status = Column(String(20), default="normal")  # optimal | warning | danger
    optimal_range = Column(String(50), nullable=True)
    timestamp = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="metrics")


class JointAngle(Base):
    """Per-frame joint angle data for detailed analysis."""
    __tablename__ = "joint_angles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False, index=True)
    frame_number = Column(Integer, nullable=False)
    joint_name = Column(String(50), nullable=False)
    angle_degrees = Column(Float, nullable=True)
    camera = Column(String(20), default="back")  # left | back | right
    timestamp = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="joint_angles")


class Alert(Base):
    """Real-time posture/form alerts generated during analysis."""
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False, index=True)
    severity = Column(String(20), default="warning")  # info | warning | danger
    category = Column(String(50), nullable=True)  # posture | gait | alignment
    message = Column(Text, nullable=False)
    joint = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="alerts")


class AiSummary(Base):
    """Gemini AI-generated session summary."""
    __tablename__ = "ai_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False, unique=True)
    summary_text = Column(Text, nullable=False)
    model_used = Column(String(100), default="rule-based")
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="ai_summary")


class Recommendation(Base):
    """AI-generated exercise and correction recommendations."""
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False, index=True)
    category = Column(String(50))  # posture | strength | mobility | technique
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    sets_reps = Column(String(100), nullable=True)
    priority = Column(Integer, default=1)  # 1=high, 2=medium, 3=low
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="recommendations")


class Report(Base):
    """Generated report file references."""
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False, unique=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    pdf_path = Column(String(500), nullable=True)
    csv_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="report")
