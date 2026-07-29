"""
config.py
NDURANCE AI — Application Configuration
All settings loaded from environment variables with sensible defaults.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────
    APP_NAME: str = "NDURANCE AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Database ─────────────────────────────────────────────────────
    # SQLite (default) — change to MySQL URL for production
    DATABASE_URL: str = "sqlite:///./ndurance.db"
    # MySQL example: "mysql+pymysql://user:pass@localhost:3306/ndurance_ai"

    # ── Security ─────────────────────────────────────────────────────
    SECRET_KEY: str = "ndurance-ai-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── Gemini AI ────────────────────────────────────────────────────
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # ── Google OAuth ─────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # ── Email / OTP ──────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None

    # ── Camera ───────────────────────────────────────────────────────
    CAMERA_LEFT_INDEX: int = 0
    CAMERA_BACK_INDEX: int = 1
    CAMERA_RIGHT_INDEX: int = 2
    CAMERA_FPS: int = 30
    CAMERA_WIDTH: int = 640
    CAMERA_HEIGHT: int = 480

    # ── Storage ──────────────────────────────────────────────────────
    REPORTS_DIR: str = "./reports_output"
    SNAPSHOTS_DIR: str = "./snapshots"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
