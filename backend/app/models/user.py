"""
models/user.py
NDURANCE AI — User ORM Model

Matches the hand-created `users` table exactly (user_id/name/email/password/
age/height/weight/created_at). The Python attribute is still called `.id`
(mapped to the `user_id` column) so the rest of the codebase — JWT claims,
routers — doesn't need to change every reference.
"""
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Boolean
from sqlalchemy.sql import expression
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column("user_id", Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # bcrypt/pbkdf2 hash, not plaintext
    age = Column(Integer, nullable=True)
    height = Column(Numeric(5, 2), nullable=True)  # cm
    weight = Column(Numeric(5, 2), nullable=True)  # kg
    created_at = Column(DateTime, server_default=func.now())

    # ── Added back for the frontend's built-in OTP verification step ──
    # (not in the original hand-created DDL — additive only, nothing above changed)
    is_verified = Column(Boolean, nullable=False, default=False, server_default=expression.false())
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)

    # Relationships
    videos = relationship("Video", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"
