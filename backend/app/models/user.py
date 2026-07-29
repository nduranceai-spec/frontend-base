"""
models/user.py
NDURANCE AI — User ORM Model
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    athlete = "athlete"
    coach = "coach"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Null for Google OAuth users
    role = Column(Enum(UserRole), default=UserRole.athlete, nullable=False)

    # Profile
    height_cm = Column(String(10), nullable=True)
    weight_kg = Column(String(10), nullable=True)
    experience_level = Column(String(50), default="beginner")
    sport = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # OAuth
    google_id = Column(String(255), unique=True, nullable=True)

    # OTP
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    is_email_verified = Column(Boolean, default=False)

    # Account state
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
