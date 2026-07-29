"""
routers/auth.py
NDURANCE AI — Authentication Router
Endpoints: Signup, Login, OTP Verify, Forgot Password, Me
"""
import random
import string
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.utils.jwt_handler import create_access_token, get_current_user_id
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ── Password hashing ─────────────────────────────────────────────────────
# Use bcrypt_sha256 to avoid bcrypt's 72-byte raw-password limit by
# hashing with SHA-256 first (safer for arbitrary-length inputs).
# Use PBKDF2-SHA256 for password hashing in dev to avoid native bcrypt
# compatibility issues. PBKDF2-SHA256 is secure and has no 72-byte limit.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))


# ── Request / Response Schemas ────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    experience_level: str = "beginner"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    experience_level: Optional[str] = None
    sport: Optional[str] = None


def _user_response(user: User, token: str) -> dict:
    """Standard user response payload."""
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_email_verified,
            "height_cm": user.height_cm,
            "weight_kg": user.weight_kg,
            "experience_level": user.experience_level,
            "sport": user.sport,
            "avatar_url": user.avatar_url,
            "created_at": str(user.created_at),
        }
    }


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Register a new NDURANCE AI user."""
    # Check duplicate email
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Generate and store OTP for email verification
    otp = generate_otp()
    otp_expires = datetime.utcnow() + timedelta(minutes=15)

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        height_cm=str(payload.height_cm) if payload.height_cm else None,
        weight_kg=str(payload.weight_kg) if payload.weight_kg else None,
        experience_level=payload.experience_level,
        otp_code=otp,
        otp_expires_at=otp_expires,
        is_email_verified=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})

    # TODO: Send OTP email when SMTP is configured
    print(f"[OTP] User {user.email} OTP: {otp}")  # Dev only — remove in prod

    return {
        **_user_response(user, token),
        "message": "Account created. Please verify your email with the OTP sent.",
        "otp_required": True,
        # Dev only — remove in prod:
        "dev_otp": otp if settings.DEBUG else None,
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact support."
        )

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})

    return {
        **_user_response(user, token),
        "message": "Login successful.",
    }


@router.post("/verify-otp")
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify email OTP for account activation."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.is_email_verified:
        return {"message": "Email already verified."}

    if not user.otp_code or user.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    if user.otp_expires_at and datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Request a new one.")

    user.is_email_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Email verified successfully! Your account is now active."}


@router.post("/resend-otp")
def resend_otp(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Resend OTP to email for verification."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    print(f"[OTP] Resent to {user.email}: {otp}")

    return {
        "message": "OTP resent. Check your email.",
        "dev_otp": otp if settings.DEBUG else None,
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate password reset by sending OTP."""
    user = db.query(User).filter(User.email == payload.email).first()

    # Don't reveal if email exists (security)
    if user:
        otp = generate_otp()
        user.otp_code = otp
        user.otp_expires_at = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        print(f"[Password Reset OTP] {user.email}: {otp}")

    return {
        "message": "If this email is registered, a reset code has been sent.",
        "dev_otp": user.otp_code if user and settings.DEBUG else None,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password with OTP verification."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not user.otp_code:
        raise HTTPException(status_code=400, detail="Invalid reset request.")

    if user.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    if user.otp_expires_at and datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user.password_hash = hash_password(payload.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password reset successfully. Please log in with your new password."}


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get current authenticated user profile."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_email_verified,
        "height_cm": user.height_cm,
        "weight_kg": user.weight_kg,
        "experience_level": user.experience_level,
        "sport": user.sport,
        "avatar_url": user.avatar_url,
        "created_at": str(user.created_at),
    }


@router.patch("/profile")
def update_profile(
    payload: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update user profile fields."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.name: user.name = payload.name
    if payload.height_cm: user.height_cm = str(payload.height_cm)
    if payload.weight_kg: user.weight_kg = str(payload.weight_kg)
    if payload.experience_level: user.experience_level = payload.experience_level
    if payload.sport: user.sport = payload.sport

    db.commit()
    db.refresh(user)

    return {"message": "Profile updated.", "user": {"name": user.name, "sport": user.sport}}
