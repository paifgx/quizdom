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
from app.schemas.auth import (
    TokenResponse,
    UserRegisterRequest,
    UserResponse,
    UserProfileResponse,
    UserProfileUpdate,
)
from app.services.auth_service import AuthService

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
    Checks if user account has been soft-deleted.

    Args:
        token: JWT token from Authorization header
        session: Database session dependency

    Returns:
        User: The authenticated user

    Raises:
        HTTPException: When token is invalid, user not found, or account is deleted
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Anmeldedaten konnten nicht validiert werden",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = verify_token(token)
    if token_data is None or token_data.email is None:
        raise credentials_exception

    statement = select(User).where(User.email == token_data.email)
    user = session.exec(statement).first()

    if user is None:
        raise credentials_exception

    # Check if user account has been soft-deleted
    if user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account wurde gelöscht",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_user_with_role(session: Session, user: User) -> UserResponse:
    """Get user with role information for response.

    Joins user data with role information and returns UserResponse.

    Args:
        session: Database session
        user: User object to get role information for

    Returns:
        UserResponse: User data with role information
    """
    # Get role name if user has a role through UserRoles
    role_name = None
    role_id = None

    # Check if user has direct role_id (backwards compatibility)
    if hasattr(user, "role_id") and getattr(user, "role_id") is not None:
        role_id = getattr(user, "role_id")
        role = session.get(Role, role_id)
        if role:
            role_name = role.name
    # Otherwise check the UserRoles table
    elif user.id:
        # Query for user's role through UserRoles table
        statement = (
            select(Role.id, Role.name)
            .join(UserRoles)
            .where(UserRoles.role_id == Role.id)
            .where(UserRoles.user_id == user.id)
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

    Args:
        session: Database session
        email: Email address to search for

    Returns:
        Optional[User]: User if found, None otherwise
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

    Args:
        user_data: User registration data
        session: Database session dependency

    Returns:
        TokenResponse: Access token and user information

    Raises:
        HTTPException: When registration fails
    """
    log_operation(app_logger, "user_registration_attempt", email=user_data.email)

    # WHY: Check for existing user to prevent duplicates
    existing_user = get_user_by_email(session, user_data.email)
    if existing_user:
        log_operation(
            app_logger, "registration_failed_duplicate_email", email=user_data.email
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
            headers={
                "X-Error-Code": "user_already_exists",
                "X-Error-Field": "email",
                "X-Error-Hint": "Bitte verwenden Sie eine andere E-Mail-Adresse oder melden Sie sich an",
            },
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
    Prevents login for soft-deleted accounts.

    Args:
        form_data: OAuth2 form data with username and password
        session: Database session dependency

    Returns:
        TokenResponse: Access token and user information

    Raises:
        HTTPException: When authentication fails or account is deleted
    """
    # WHY: OAuth2 form uses 'username' field for email
    user = get_user_by_email(session, form_data.username)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falsche E-Mail oder Passwort",
            headers={
                "WWW-Authenticate": "Bearer",
                "X-Error-Code": "invalid_credentials",
            },
        )

    # Check if account has been deleted
    if user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account wurde gelöscht",
            headers={
                "WWW-Authenticate": "Bearer",
                "X-Error-Code": "account_deleted",
            },
        )

    access_token = create_access_token(data={"sub": user.email})

    user_response = get_user_with_role(session, user)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> UserProfileResponse:
    """Get current user profile information.

    Returns complete user profile with stats for display.
    Requires valid JWT token in Authorization header.

    Args:
        current_user: Authenticated user from token
        session: Database session dependency

    Returns:
        UserProfileResponse: Complete user profile with stats
    """
    service = AuthService(session)
    return service.get_user_profile(current_user)


@router.put("/me", response_model=UserProfileResponse)
def update_current_user_profile(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> UserProfileResponse:
    """Update current user profile.

    Updates profile with whitelisted fields: nickname, avatar_url, bio.
    Validates nickname uniqueness if provided.

    Args:
        update_data: Profile update data
        current_user: Authenticated user from token
        session: Database session dependency

    Returns:
        UserProfileResponse: Updated user profile with stats

    Raises:
        HTTPException 409: When nickname is already taken
        HTTPException 400: When validation fails
    """
    if current_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Benutzer-ID fehlt",
        )

    service = AuthService(session)
    return service.update_user_profile(current_user.id, update_data)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_account(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    """Soft delete current user account.

    Marks account as deleted and revokes all refresh tokens.
    User will be immediately logged out across all sessions.

    Args:
        current_user: Authenticated user from token
        session: Database session dependency

    Returns:
        None (204 No Content)
    """
    if current_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Benutzer-ID fehlt",
        )

    service = AuthService(session)
    service.soft_delete_user(current_user.id)

    # TODO: Broadcast logout via WebSocket
    # TODO: Clear Redis cache if exists
