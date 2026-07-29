"""
database.py
NDURANCE AI — SQLAlchemy Database Engine
Supports SQLite (dev) and MySQL (production).
"""
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import os

# Create reports and snapshots directories
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
os.makedirs(settings.SNAPSHOTS_DIR, exist_ok=True)

# ── Engine Setup ────────────────────────────────────────────────────────
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.DEBUG,
)

# Enable WAL mode for SQLite concurrency
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# ── Session Factory ─────────────────────────────────────────────────────
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
