"""
routers/auth.py
NDURANCE AI — Authentication Router
Endpoints: Signup (+ dev OTP), Verify OTP, Resend OTP, Login, Me, Update Profile,
Change Password.

OTP is dev-mode only: a random 6-digit code is generated and returned directly
in the API response (`dev_otp`) so it can be typed into the frontend's OTP
step without wiring up a real email/SMS provider. No Google/OAuth integration.

Note: the hand-created `users` table has no role/avatar/experience_level/sport
columns, so those (present in the original design) aren't persisted — the
frontend simply falls back to its defaults for them. Out of scope for this
change; ask if you want those added too.
"""
import random
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.utils.jwt_handler import create_access_token, get_current_user_id

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

OTP_EXPIRE_MINUTES = 10


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def generate_otp() -> str:
    """Random 6-digit code, e.g. '004821'."""
    return f"{random.randint(0, 999999):06d}"


def normalized_email(email: EmailStr) -> str:
    return str(email).strip().lower()


# ── Request / Response Schemas ────────────────────────────────────────────
# Field names (height_cm/weight_kg) match the frontend's existing payload —
# stored internally in the shorter `height`/`weight` DB columns.

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    experience_level: Optional[str] = None  # accepted, not persisted (no column)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendOtpRequest(BaseModel):
    email: EmailStr


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    experience_level: Optional[str] = None  # accepted, not persisted
    sport: Optional[str] = None             # accepted, not persisted


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


def _user_public(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_verified": user.is_verified,
        "height_cm": float(user.height) if user.height is not None else None,
        "weight_kg": float(user.weight) if user.weight is not None else None,
        "created_at": str(user.created_at),
    }


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user and issue a dev-mode OTP for email verification."""
    email = normalized_email(payload.email)
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    otp = generate_otp()
    user = User(
        name=payload.name,
        email=email,
        password=hash_password(payload.password),
        height=payload.height_cm,
        weight=payload.weight_kg,
        is_verified=False,
        otp_code=otp,
        otp_expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Account created. Enter the OTP below to verify your email.",
        "dev_otp": otp,
    }


@router.post("/verify-otp")
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """Verify a signup OTP."""
    email = normalized_email(payload.email)
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.is_verified:
        return {"message": "Email already verified."}

    if not user.otp_code or user.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP.")

    if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Email verified successfully."}


@router.post("/resend-otp")
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    """Generate and return a fresh dev-mode OTP."""
    email = normalized_email(payload.email)
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.is_verified:
        return {"message": "Email already verified."}

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)
    db.commit()

    return {"message": "New OTP generated.", "dev_otp": otp}


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    email = normalized_email(payload.email)
    user = db.query(User).filter(func.lower(User.email) == email).first()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email with the OTP before logging in.",
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})

    return {
        "token": token,
        "user": _user_public(user),
        "message": "Login successful.",
    }


@router.get("/me")
def get_me(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get current authenticated user profile."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return _user_public(user)


@router.patch("/profile")
def update_profile(
    payload: UpdateProfileRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update user profile fields."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.name is not None:
        user.name = payload.name
    if payload.height_cm is not None:
        user.height = payload.height_cm
    if payload.weight_kg is not None:
        user.weight = payload.weight_kg

    db.commit()
    db.refresh(user)

    return {"message": "Profile updated.", "user": _user_public(user)}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Change password — requires the current password."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not verify_password(payload.current_password, user.password):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user.password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully."}
