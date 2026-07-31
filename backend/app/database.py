"""
database.py
NDURANCE AI — SQLAlchemy Database Engine
PostgreSQL only.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import os

os.makedirs(settings.REPORTS_DIR, exist_ok=True)
os.makedirs(settings.SNAPSHOTS_DIR, exist_ok=True)

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Base Model ──────────────────────────────────────────────────────────
Base = declarative_base()


def get_db():
    """FastAPI dependency to get a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables — called on app startup."""
    Base.metadata.create_all(bind=engine)
