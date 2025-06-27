"""Authentication router with login and registration endpoints.

This module provides secure authentication endpoints following OAuth2 standards.
It handles user registration, login, and token-based authentication.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.core.logging import app_logger, log_operation
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.db.models import Role, User, UserRoles
from app.db.session import get_session
from app.schemas.auth import TokenResponse, UserRegisterRequest, UserResponse

router = APIRouter(prefix="/v1/auth", tags=["auth"])

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    """Get current authenticated user from JWT token.

    Validates the JWT token and returns the corresponding user.
    Used as a dependency for protected endpoints.
    """
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


def get_user_with_role(session: Session, user: User) -> UserResponse:
    """Get user with role information for response.

    Joins user data with role information and returns UserResponse.
    """
    # Get role name if user has a role through UserRoles
    role_name = None
    role_id = None

    if user.id:
        # Query for user's role through UserRoles table
        statement = (
            select(Role.id, Role.name)
            .join(UserRoles)
            .where(UserRoles.user_id == user.id)
            .where(UserRoles.role_id == Role.id)
        )
        result = session.exec(statement).first()

        if result:
            role_id, role_name = result

    return UserResponse(
        id=user.id or 0,
        email=user.email,
        is_verified=user.is_verified,
        role_id=role_id,
        role_name=role_name,
    )


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Get user by email address.

    Used for authentication and user lookup operations.
    Returns None if no user exists with the given email.
    """
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


@router.post("/register", response_model=TokenResponse)
def register_user(
    user_data: UserRegisterRequest,
    session: Session = Depends(get_session),
) -> TokenResponse:
    """Register a new user account.

    Creates a new user with hashed password and returns an access token.
    """
    log_operation(app_logger, "user_registration_attempt",
                  email=user_data.email)

    # WHY: Check for existing user to prevent duplicates
    existing_user = get_user_by_email(session, user_data.email)
    if existing_user:
        log_operation(
            app_logger, "registration_failed_duplicate_email", email=user_data.email
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        is_verified=False,
        created_at=datetime.now(timezone.utc),
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email})

    user_response = get_user_with_role(session, new_user)

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
    """Authenticate user and return access token.

    Validates credentials and returns a JWT token with user data.
    Uses OAuth2 password flow for compatibility with frontend.
    """
    # WHY: OAuth2 form uses 'username' field for email
    user = get_user_by_email(session, form_data.username)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})

    user_response = get_user_with_role(session, user)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> UserResponse:
    """Get current user information.

    Returns authenticated user details for profile display.
    Requires valid JWT token in Authorization header.
    """
    return get_user_with_role(session, current_user)
