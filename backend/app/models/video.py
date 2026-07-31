"""
models/video.py
NDURANCE AI — Video Upload + Per-Frame Position (Pose Landmark) ORM Models
Matches the hand-created `videos` and `positions` tables exactly.
"""
from sqlalchemy import (
    Column, Integer, String, Text, Float, BigInteger, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Video(Base):
    """An uploaded video, analyzed frame-by-frame into `positions`."""
    __tablename__ = "videos"

    id = Column("video_id", Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    video_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_type = Column(String(20), nullable=True)
    file_size = Column(BigInteger, nullable=True)
    duration = Column(Float, nullable=True)
    uploaded_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="videos")
    positions = relationship("Position", back_populates="video", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Video {self.video_name}>"


class Position(Base):
    """A single body-landmark position for one frame of a video."""
    __tablename__ = "positions"

    id = Column("frame_id", Integer, primary_key=True, autoincrement=True)
    video_id = Column(Integer, ForeignKey("videos.video_id", ondelete="CASCADE"), nullable=False, index=True)
    frame_number = Column(Integer, nullable=False)
    body_part = Column(String(30), nullable=True)
    side = Column(String(10), nullable=True)  # left | right | center
    x = Column(Float, nullable=True)
    y = Column(Float, nullable=True)
    z = Column(Float, nullable=True)
    visibility = Column(Float, nullable=True)

    video = relationship("Video", back_populates="positions")
