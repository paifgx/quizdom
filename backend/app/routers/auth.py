"""Authentication router with login and registration endpoints."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.db.models import User
from app.db.session import get_session
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = verify_token(token)
    if token_data is None or token_data.email is None:
        raise credentials_exception

    statement = select(User).where(User.email == token_data.email)
    user = session.exec(statement).first()

    if user is None:
        raise credentials_exception

    return user


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Get user by email address."""
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


@router.post("/register", response_model=TokenResponse)
def register_user(
    user_data: UserRegisterRequest,
    session: Session = Depends(get_session),
) -> TokenResponse:
    """Register a new user account."""
    # Check if user already exists
    existing_user = get_user_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Create new user - generate nickname from email if not provided
    hashed_password = get_password_hash(user_data.password)
    nickname = user_data.email.split("@")[0]

    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        nickname=nickname,
        is_verified=False,
        created_at=datetime.now(timezone.utc),
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Create access token
    access_token = create_access_token(data={"sub": new_user.email})

    # Return token and user data
    user_response = UserResponse(
        # Fallback to 0 if id is None (shouldn't happen after commit)
        id=new_user.id or 0,
        email=new_user.email,
        nickname=new_user.nickname,
        is_verified=new_user.is_verified,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


@router.post("/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
) -> TokenResponse:
    """Authenticate user and return access token."""
    # Find user by email (username field in OAuth2 form)
    user = get_user_by_email(session, form_data.username)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(data={"sub": user.email})

    # Return token and user data
    user_response = UserResponse(
        id=user.id or 0,  # Fallback to 0 if id is None
        email=user.email,
        nickname=user.nickname,
        is_verified=user.is_verified,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


@router.post("/login-json", response_model=TokenResponse)
def login_user_json(
    user_data: UserLoginRequest,
    session: Session = Depends(get_session),
) -> TokenResponse:
    """Authenticate user with JSON payload and return access token."""
    # Find user by email
    user = get_user_by_email(session, user_data.email)

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Create access token
    access_token = create_access_token(data={"sub": user.email})

    # Return token and user data
    user_response = UserResponse(
        id=user.id or 0,  # Fallback to 0 if id is None
        email=user.email,
        nickname=user.nickname,
        is_verified=user.is_verified,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Get current user information."""
    return UserResponse(
        id=current_user.id or 0,  # Fallback to 0 if id is None
        email=current_user.email,
        nickname=current_user.nickname,
        is_verified=current_user.is_verified,
    )
