"""
main.py
NDURANCE AI — FastAPI Application Entry Point
Intelligent Human Motion Analysis & Performance Monitoring System
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import create_tables
from app.routers import auth, sessions, reports
from app.routers.live import router as live_router


# ── Rate Limiter ─────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ── Lifespan (startup / shutdown) ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables and directories on startup."""
    print("🚀 NDURANCE AI — Starting up...")
    create_tables()
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    os.makedirs(settings.SNAPSHOTS_DIR, exist_ok=True)
    print(f"✅ Database ready | Reports dir: {settings.REPORTS_DIR}")
    print(f"🤖 Gemini API: {'Configured' if settings.GEMINI_API_KEY else 'Not configured (rule-based fallback active)'}")
    yield
    print("🛑 NDURANCE AI — Shutting down...")


# ── FastAPI App ───────────────────────────────────────────────────────────
app = FastAPI(
    title="NDURANCE AI",
    description=(
        "Intelligent Human Motion Analysis & Performance Monitoring System. "
        "Real-time posture, gait, running and exercise form analysis using "
        "3 synchronized cameras with MediaPipe Pose and Gemini AI."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── Attach rate limiter ───────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ── CORS Middleware ───────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ─────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again.", "error": str(exc)},
    )


# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(reports.router)
app.include_router(live_router)      # WebSocket routes


# ── Health Check ──────────────────────────────────────────────────────────
@app.get("/api/health", tags=["System"])
def health_check():
    """System health check endpoint."""
    try:
        import mediapipe  # noqa
        mp_status = "available"
    except ImportError:
        mp_status = "not_installed"

    try:
        import cv2  # noqa
        cv_status = f"available (v{cv2.__version__})"
    except ImportError:
        cv_status = "not_installed"

    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "mediapipe": mp_status,
        "opencv": cv_status,
        "gemini": "configured" if settings.GEMINI_API_KEY else "not_configured",
        "database": settings.SQLALCHEMY_DATABASE_URL.split("://")[0],
    }


@app.get("/api/ping", tags=["System"])
def ping():
    return {"pong": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        ws_ping_interval=20,
        ws_ping_timeout=20,
    )
