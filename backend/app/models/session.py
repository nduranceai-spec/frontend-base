"""
models/session.py
NDURANCE AI — Session + Analysis ORM Models (hybrid schema)

`sessions` keeps the columns from the hand-created table (session_id, user_id,
activity, started_at) and adds the extra columns the app's live-analysis
features already depend on (duration, score, frame count, etc.) — nothing
here removes or renames those four original columns.

Metric / JointAngle / Alert / AiSummary / Recommendation / Report are
re-added (they don't exist in the hand-written DDL) so session analytics,
AI summaries, recommendations, and PDF/CSV reports keep working. They all
foreign-key into `sessions.session_id`.
"""
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class ActivityType(str, enum.Enum):
    """Validation-only enum — `sessions.activity` is a plain VARCHAR(100)
    column (per the hand-created table), not a native Postgres enum type."""
    standing = "standing"
    walking = "walking"
    running = "running"
    squat = "squat"
    pushup = "pushup"
    lunge = "lunge"
    jump = "jump"
    unknown = "unknown"


class Session(Base):
    __tablename__ = "sessions"

    id = Column("session_id", Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    activity = Column(String(100), nullable=True)
    started_at = Column(DateTime, server_default=func.now())

    # ── Added back for live-analysis features (not in the original hand DDL) ──
    video_id = Column(Integer, ForeignKey("videos.video_id"), nullable=True)
    session_type = Column(String(20), default="live")  # live | upload
    camera_count = Column(Integer, default=3)
    duration_seconds = Column(Float, default=0.0)
    frames_analyzed = Column(Integer, default=0)
    overall_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="sessions")
    video = relationship("Video")
    metrics = relationship("Metric", back_populates="session", cascade="all, delete-orphan")
    joint_angles = relationship("JointAngle", back_populates="session", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="session", cascade="all, delete-orphan")
    ai_summary = relationship("AiSummary", back_populates="session", uselist=False, cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="session", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="session", uselist=False, cascade="all, delete-orphan")

    # ── Back-compat aliases so router code written against the old schema
    #    (session.activity_type / session.created_at) keeps working unchanged ──
    @property
    def activity_type(self):
        return self.activity

    @activity_type.setter
    def activity_type(self, value):
        self.activity = value.value if isinstance(value, ActivityType) else value

    @property
    def created_at(self):
        return self.started_at

    def __repr__(self):
        return f"<Session {self.id} [{self.activity}]>"


class Metric(Base):
    """Time-series biomechanical metrics per session."""
    __tablename__ = "metrics"

    id = Column("metric_id", Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=True)
    unit = Column(String(30), nullable=True)
    status = Column(String(20), default="normal")  # optimal | warning | danger
    optimal_range = Column(String(50), nullable=True)
    timestamp = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="metrics")


class JointAngle(Base):
    """Per-frame joint angle data captured during a live session."""
    __tablename__ = "joint_angles"

    id = Column("angle_id", Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    frame_number = Column(Integer, nullable=False)
    joint_name = Column(String(50), nullable=False)
    angle_degrees = Column(Float, nullable=True)
    camera = Column(String(20), default="back")  # left | back | right
    timestamp = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="joint_angles")


class Alert(Base):
    """Real-time posture/form alerts generated during analysis."""
    __tablename__ = "alerts"

    id = Column("alert_id", Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(String(20), default="warning")  # info | warning | danger
    category = Column(String(50), nullable=True)  # posture | gait | alignment
    message = Column(Text, nullable=False)
    joint = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="alerts")


class AiSummary(Base):
    """Gemini AI-generated session summary."""
    __tablename__ = "ai_summaries"

    id = Column("summary_id", Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False, unique=True)
    summary_text = Column(Text, nullable=False)
    model_used = Column(String(100), default="rule-based")
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="ai_summary")


class Recommendation(Base):
    """AI-generated exercise and correction recommendations."""
    __tablename__ = "recommendations"

    id = Column("recommendation_id", Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50))  # posture | strength | mobility | technique
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    sets_reps = Column(String(100), nullable=True)
    priority = Column(Integer, default=1)  # 1=high, 2=medium, 3=low
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="recommendations")


class Report(Base):
    """Generated PDF/CSV report file references."""
    __tablename__ = "reports"

    id = Column("report_id", Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    pdf_path = Column(String(500), nullable=True)
    csv_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="report")
    user = relationship("User", back_populates="reports")
