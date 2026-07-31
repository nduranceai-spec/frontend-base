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

    # ── Database (PostgreSQL) ─────────────────────────────────────────
    DATABASE_URL: Optional[str] = None

    POSTGRES_USER: str = "ndur_user"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "ndur_db"

    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        auth = self.POSTGRES_USER
        if self.POSTGRES_PASSWORD:
            auth += f":{self.POSTGRES_PASSWORD}"
        return (
            f"postgresql+psycopg2://{auth}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

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
