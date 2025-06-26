"""User management router for admin operations.

This module provides endpoints for administrators to manage users,
including creating, reading, updating, and deleting user accounts.
"""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.logging import app_logger, log_operation
from app.core.security import get_password_hash
from app.db.models import GameSession, Role, User
from app.db.session import get_session
from app.routers.auth import get_current_user
from app.schemas.user import (
    RoleResponse,
    UserCreateRequest,
    UserListResponse,
    UserStatsResponse,
    UserStatusUpdateRequest,
    UserUpdateRequest,
)

router = APIRouter(tags=["user-management"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role for accessing endpoints.

    Verifies that the current user has admin privileges.
    Used as a dependency for admin-only endpoints.
    """
    if not current_user.role_id or current_user.role_id != 1:
        log_operation(app_logger, "admin_access_denied", user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    return current_user


def _build_user_query_filters(
    query,
    search: Optional[str],
    role_filter: Optional[str],
    status_filter: Optional[str],
):
    """Apply filters to user query based on search parameters.

    Reduces complexity in list_users by extracting filter logic.
    """
    if search:
        query = query.where(User.email.contains(search.lower()))

    if role_filter and role_filter != "all":
        query = query.where(Role.name == role_filter)

    if status_filter == "active":
        query = query.where(User.deleted_at.is_(None))
    elif status_filter == "inactive":
        query = query.where(User.deleted_at.is_not(None))
    elif status_filter == "verified":
        query = query.where(User.is_verified.is_(True))
    elif status_filter == "unverified":
        query = query.where(User.is_verified.is_(False))

    return query


def _build_user_response_with_stats(
    session: Session, user: User, role_name: Optional[str]
) -> UserListResponse:
    """Build user response with quiz statistics.

    Extracts the complex user statistics building logic to reduce
    function length in multiple endpoints.
    """
    quiz_stats = session.exec(
        select(
            func.count(GameSession.id).label("quizzes_completed"),
            func.coalesce(func.avg(GameSession.score), 0).label("average_score"),
            func.coalesce(func.sum(GameSession.score), 0).label("total_score"),
        ).where(GameSession.user_id == user.id)
    ).first()

    last_session = session.exec(
        select(GameSession.started_at)
        .where(GameSession.user_id == user.id)
        .order_by(GameSession.started_at.desc())
        .limit(1)
    ).first()

    # Handle quiz_stats tuple unpacking
    if quiz_stats:
        completed, avg_score, total_score = quiz_stats
        completed = completed or 0
        avg_score = float(avg_score) if avg_score else 0.0
        total_score = total_score or 0
    else:
        completed, avg_score, total_score = 0, 0.0, 0

    return UserListResponse(
        id=user.id,
        email=user.email,
        is_verified=user.is_verified,
        created_at=user.created_at,
        deleted_at=user.deleted_at,
        role_name=role_name,
        last_login=last_session,
        quizzes_completed=completed,
        average_score=avg_score,
        total_score=total_score,
    )


@router.get("/users", response_model=List[UserListResponse])
async def list_users(
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    role_filter: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
) -> List[UserListResponse]:
    """List all users with optional filtering and pagination.

    Returns a paginated list of users with their statistics.
    Supports filtering by email, role, and status.
    """
    log_operation(
        app_logger, "list_users", admin_id=admin_user.id, skip=skip, limit=limit
    )

    query = select(User, Role.name).outerjoin(Role)
    query = _build_user_query_filters(query, search, role_filter, status_filter)
    query = query.offset(skip).limit(limit)

    results = session.exec(query).all()

    user_responses = [
        _build_user_response_with_stats(session, user, role_name)
        for user, role_name in results
    ]

    log_operation(app_logger, "list_users_success", count=len(user_responses))
    return user_responses


@router.get("/users/stats", response_model=UserStatsResponse)
async def get_user_stats(
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
) -> UserStatsResponse:
    """Get user statistics for admin dashboard.

    Returns aggregated statistics about users for admin overview.
    """
    total_users = session.exec(select(func.count(User.id))).first()

    active_users = session.exec(
        select(func.count(User.id)).where(User.deleted_at.is_(None))
    ).first()

    admin_users = session.exec(
        select(func.count(User.id)).where(User.role_id == 1)
    ).first()

    verified_users = session.exec(
        select(func.count(User.id)).where(User.is_verified is True)
    ).first()

    current_month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    new_users_this_month = session.exec(
        select(func.count(User.id)).where(User.created_at >= current_month_start)
    ).first()

    return UserStatsResponse(
        total_users=total_users or 0,
        active_users=active_users or 0,
        admin_users=admin_users or 0,
        verified_users=verified_users or 0,
        new_users_this_month=new_users_this_month or 0,
    )


@router.get("/users/{user_id}", response_model=UserListResponse)
async def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
) -> UserListResponse:
    """Get a specific user by ID.

    Returns detailed information about a specific user.
    """
    log_operation(
        app_logger, "get_user", admin_id=admin_user.id, target_user_id=user_id
    )

    result = session.exec(
        select(User, Role.name).outerjoin(Role).where(User.id == user_id)
    ).first()

    if not result:
        log_operation(app_logger, "get_user_not_found", user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user, role_name = result
    response = _build_user_response_with_stats(session, user, role_name)

    log_operation(app_logger, "get_user_success", user_id=user_id)
    return response


def _validate_create_user_data(session: Session, user_data: UserCreateRequest) -> None:
    """Validate user creation data and raise HTTPException if invalid.

    Checks for email uniqueness and role validity.
    Extracted to reduce complexity in create_user function.
    """
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    if user_data.role_id:
        role = session.exec(select(Role).where(Role.id == user_data.role_id)).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role ID"
            )


@router.post("/users", response_model=UserListResponse)
async def create_user(
    user_data: UserCreateRequest,
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
) -> UserListResponse:
    """Create a new user.

    Creates a new user account with the specified email and role.
    """
    log_operation(
        app_logger, "create_user", admin_id=admin_user.id, email=user_data.email
    )

    _validate_create_user_data(session, user_data)

    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        is_verified=user_data.is_verified,
        role_id=user_data.role_id,
        created_at=datetime.now(timezone.utc),
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Get role name for response
    role_name = None
    if new_user.role_id:
        role = session.exec(select(Role).where(Role.id == new_user.role_id)).first()
        role_name = role.name if role else None

    log_operation(app_logger, "create_user_success", user_id=new_user.id)

    return UserListResponse(
        id=new_user.id,
        email=new_user.email,
        is_verified=new_user.is_verified,
        created_at=new_user.created_at,
        deleted_at=new_user.deleted_at,
        role_name=role_name,
        last_login=None,
        quizzes_completed=0,
        average_score=0.0,
        total_score=0,
    )


def _validate_update_user_data(
    session: Session, user: User, user_data: UserUpdateRequest
) -> None:
    """Validate user update data and raise HTTPException if invalid.

    Checks role validity and email uniqueness for updates.
    Extracted to reduce complexity in update_user function.
    """
    if user_data.role_id:
        role = session.exec(select(Role).where(Role.id == user_data.role_id)).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role ID"
            )

    if user_data.email and user_data.email != user.email:
        existing_user = session.exec(
            select(User).where(User.email == user_data.email)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )


def _apply_user_updates(user: User, user_data: UserUpdateRequest) -> None:
    """Apply user updates to user object.

    Updates user fields based on provided data.
    Extracted to reduce function complexity.
    """
    if user_data.email:
        user.email = user_data.email
    if user_data.is_verified is not None:
        user.is_verified = user_data.is_verified
    if user_data.role_id is not None:
        user.role_id = user_data.role_id


@router.put("/users/{user_id}", response_model=UserListResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
) -> UserListResponse:
    """Update an existing user.

    Updates user information including email, verification status, and role.
    """
    log_operation(
        app_logger, "update_user", admin_id=admin_user.id, target_user_id=user_id
    )

    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        log_operation(app_logger, "update_user_not_found", user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    _validate_update_user_data(session, user, user_data)
    _apply_user_updates(user, user_data)

    session.add(user)
    session.commit()
    session.refresh(user)

    # Get updated user with role for response
    result = session.exec(
        select(User, Role.name).outerjoin(Role).where(User.id == user_id)
    ).first()

    user, role_name = result
    response = _build_user_response_with_stats(session, user, role_name)

    log_operation(app_logger, "update_user_success", user_id=user_id)
    return response


@router.put("/users/{user_id}/status", response_model=UserListResponse)
async def update_user_status(
    user_id: int,
    status_data: UserStatusUpdateRequest,
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
) -> UserListResponse:
    """Update user status (activate/deactivate).

    Soft deletes or restores a user account.
    """
    # Get user
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Prevent admin from deactivating themselves
    if user_id == admin_user.id and status_data.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )

    # Update status
    user.deleted_at = status_data.deleted_at

    session.add(user)
    session.commit()
    session.refresh(user)

    # Get updated user with role
    result = session.exec(
        select(User, Role.name)
        .outerjoin(Role, User.role_id == Role.id)
        .where(User.id == user_id)
    ).first()

    user, role_name = result

    # Get user statistics
    quiz_stats = session.exec(
        select(
            func.count(GameSession.id).label("quizzes_completed"),
            func.coalesce(func.avg(GameSession.score), 0).label("average_score"),
            func.coalesce(func.sum(GameSession.score), 0).label("total_score"),
        ).where(GameSession.user_id == user.id)
    ).first()

    # Get last login
    last_session = session.exec(
        select(GameSession.started_at)
        .where(GameSession.user_id == user.id)
        .order_by(GameSession.started_at.desc())
        .limit(1)
    ).first()

    return UserListResponse(
        id=user.id,
        email=user.email,
        is_verified=user.is_verified,
        created_at=user.created_at,
        deleted_at=user.deleted_at,
        role_name=role_name,
        last_login=last_session,
        quizzes_completed=quiz_stats.quizzes_completed if quiz_stats else 0,
        average_score=(
            float(quiz_stats.average_score)
            if quiz_stats and quiz_stats.average_score
            else 0.0
        ),
        total_score=quiz_stats.total_score if quiz_stats else 0,
    )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
) -> dict[str, str]:
    """Permanently delete a user.

    WARNING: This is a hard delete that cannot be undone.
    Use status update for soft deletion instead.
    """
    # Get user
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Prevent admin from deleting themselves
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    # Delete user (this will cascade to related records)
    session.delete(user)
    session.commit()

    return {"message": "User deleted successfully"}


@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
) -> List[RoleResponse]:
    """List all available roles.

    Returns all roles that can be assigned to users.
    """
    roles = session.exec(select(Role)).all()

    return [
        RoleResponse(
            id=role.id,
            name=role.name,
            description=role.description,
        )
        for role in roles
    ]
