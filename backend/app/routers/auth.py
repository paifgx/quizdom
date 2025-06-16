from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..core.config import settings
from ..core.email import send_reset_password_email, send_verification_email
from ..core.security import (
    generate_verification_token,
    get_token_expiry,
    hash_password,
    verify_password,
    verify_password_strength,
)
from ..db.session import get_session
from ..db.models import User, UserCreate, UserResponse

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Register a new user with email and password",
)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """Register a new user."""
    # Check if email already exists
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Verify password strength
    if not verify_password_strength(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password does not meet security requirements",
        )

    # Verify passwords match
    if user_data.password != user_data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match"
        )

    # Create verification token
    verification_token = generate_verification_token()
    token_expiry = get_token_expiry()

    # Create new user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        verification_token=verification_token,
        verification_token_expires=token_expiry,
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    # Send verification email
    await send_verification_email(
        email=user.email, token=verification_token, base_url=settings.BASE_URL
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )


@router.get("/verify-email")
async def verify_email(token: str, session: Session = Depends(get_session)):
    """Verify user email."""
    user = session.exec(
        select(User).where(
            User.verification_token == token,
            User.verification_token_expires > datetime.now(UTC),
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None

    session.add(user)
    session.commit()

    return {"message": "Email verified successfully"}


@router.post("/login")
async def login(email: str, password: str, session: Session = Depends(get_session)):
    """Login user."""
    user = session.exec(select(User).where(User.email == email)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email first",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is locked. Please check your email for reset instructions",
        )

    if not verify_password(password, user.password_hash):
        user.failed_login_attempts += 1
        user.last_failed_login = datetime.now(UTC)

        if user.failed_login_attempts >= 3:
            user.is_active = False
            # Generate reset token and send reset email
            reset_token = generate_verification_token()
            user.reset_token = reset_token
            user.reset_token_expires = get_token_expiry()
            await send_reset_password_email(
                email=user.email, token=reset_token, base_url=settings.BASE_URL
            )

        session.add(user)
        session.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    # Reset failed login attempts on successful login
    user.failed_login_attempts = 0
    session.add(user)
    session.commit()

    return {"message": "Login successful"}
