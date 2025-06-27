"""User management router for admin operations.

This module provides endpoints for administrators to manage users,
including creating, reading, updating, and deleting user accounts.
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import desc, func
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.core.logging import app_logger, log_operation
from app.core.security import get_password_hash
from app.db.models import GameSession, Role, SessionPlayers, User, UserRoles
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

router = APIRouter(prefix="/v1/users", tags=["users"])


def require_admin(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> User:
    """Require admin role for accessing endpoints.

    Verifies that the current user has admin privileges.
    Used as a dependency for admin-only endpoints.
    """
    # Check if user has admin role through UserRoles
    admin_role = session.exec(
        select(Role)
        .join(UserRoles)
        .where(UserRoles.user_id == current_user.id)
        .where(Role.name == "admin")
    ).first()

    if not admin_role:
        log_operation(app_logger, "admin_access_denied",
                      user_id=current_user.id)
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
        # Use string contains for search
        query = query.where(func.lower(User.email).like(f"%{search.lower()}%"))

    if role_filter and role_filter != "all":
        query = query.where(Role.name == role_filter)

    if status_filter == "active":
        query = query.where(User.deleted_at == None)
    elif status_filter == "inactive":
        query = query.where(User.deleted_at != None)
    elif status_filter == "verified":
        query = query.where(User.is_verified == True)
    elif status_filter == "unverified":
        query = query.where(User.is_verified == False)

    return query


def _build_user_response_with_stats(
    session: Session, user: User, role_name: Optional[str] = None
) -> UserListResponse:
    """Build user response with quiz statistics.

    Extracts the complex user statistics building logic to reduce
    function length in multiple endpoints.
    """
    # Get quiz statistics from SessionPlayers
    quiz_stats = session.exec(
        select(
            func.count().label("quizzes_completed"),
            func.coalesce(func.avg(SessionPlayers.score),
                          0).label("average_score"),
            func.coalesce(func.sum(SessionPlayers.score),
                          0).label("total_score"),
        ).where(SessionPlayers.user_id == user.id)
    ).first()

    # Get last session from SessionPlayers
    last_session = session.exec(
        select(GameSession.started_at)
        .join(SessionPlayers)
        .where(SessionPlayers.user_id == user.id)
        .where(SessionPlayers.session_id == GameSession.id)
        .order_by("gamesession.started_at DESC")
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
        id=user.id or 0,
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


@router.get("", response_model=List[UserListResponse])
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

    # Build query with left join to get users with their roles
    query = (
        select(User, Role.name)
        .outerjoin(UserRoles)
        .outerjoin(Role)
        .where(UserRoles.user_id == User.id)
        .where(UserRoles.role_id == Role.id)
    )

    query = _build_user_query_filters(
        query, search, role_filter, status_filter)
    query = query.offset(skip).limit(limit)

    results = session.exec(query).all()

    user_responses = [
        _build_user_response_with_stats(session, user, role_name)
        for user, role_name in results
    ]

    log_operation(app_logger, "list_users_success", count=len(user_responses))
    return user_responses


@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
) -> UserStatsResponse:
    """Get user statistics for admin dashboard.

    Returns aggregated statistics about users for admin overview.
    """
    total_users = session.exec(select(func.count()).select_from(User)).first()

    active_users = session.exec(
        select(func.count()).select_from(User).where(User.deleted_at == None)
    ).first()

    # Count users with admin role through UserRoles
    admin_users = session.exec(
        select(func.count(func.distinct(UserRoles.user_id)))
        .join(Role)
        .where(Role.name == "admin")
    ).first()

    verified_users = session.exec(
        select(func.count()).select_from(User).where(User.is_verified == True)
    ).first()

    current_month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    new_users_this_month = session.exec(
        select(func.count()).select_from(User).where(
            User.created_at >= current_month_start)
    ).first()

    return UserStatsResponse(
        total_users=total_users or 0,
        active_users=active_users or 0,
        admin_users=admin_users or 0,
        verified_users=verified_users or 0,
        new_users_this_month=new_users_this_month or 0,
    )


@router.get("/{user_id}", response_model=UserListResponse)
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

    # Get user with role through UserRoles
    result = session.exec(
        select(User, Role.name)
        .outerjoin(UserRoles)
        .outerjoin(Role)
        .where(UserRoles.user_id == User.id)
        .where(UserRoles.role_id == Role.id)
        .where(User.id == user_id)
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
        role = session.exec(select(Role).where(
            Role.id == user_data.role_id)).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role ID"
            )


@router.post("", response_model=UserListResponse)
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
        created_at=datetime.now(timezone.utc),
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Assign role if specified
    role_name = None
    if user_data.role_id and new_user.id:
        user_role = UserRoles(
            user_id=new_user.id,
            role_id=user_data.role_id,
            granted_at=datetime.now(timezone.utc),
        )
        session.add(user_role)
        session.commit()

        # Get role name for response
        role = session.exec(select(Role).where(
            Role.id == user_data.role_id)).first()
        role_name = role.name if role else None

    log_operation(app_logger, "create_user_success", user_id=new_user.id)

    return UserListResponse(
        id=new_user.id or 0,
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
        role = session.exec(select(Role).where(
            Role.id == user_data.role_id)).first()
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
    # Note: role_id is handled separately through UserRoles


@router.put("/{user_id}", response_model=UserListResponse)
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

    # Handle role update
    if user_data.role_id is not None:
        # Remove existing role
        existing_role = session.exec(
            select(UserRoles).where(UserRoles.user_id == user_id)
        ).first()

        if existing_role:
            session.delete(existing_role)

        # Add new role if specified
        if user_data.role_id:
            new_role = UserRoles(
                user_id=user_id,
                role_id=user_data.role_id,
                granted_at=datetime.now(timezone.utc),
            )
            session.add(new_role)

        session.commit()

    # Get updated user with role for response
    result = session.exec(
        select(User, Role.name)
        .outerjoin(UserRoles)
        .outerjoin(Role)
        .where(UserRoles.user_id == User.id)
        .where(UserRoles.role_id == Role.id)
        .where(User.id == user_id)
    ).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user, role_name = result
    response = _build_user_response_with_stats(session, user, role_name)

    log_operation(app_logger, "update_user_success", user_id=user_id)
    return response


@router.put("/{user_id}/status", response_model=UserListResponse)
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
        .outerjoin(UserRoles)
        .outerjoin(Role)
        .where(UserRoles.user_id == User.id)
        .where(UserRoles.role_id == Role.id)
        .where(User.id == user_id)
    ).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user, role_name = result

    response = _build_user_response_with_stats(session, user, role_name)

    return response


@router.delete("/{user_id}")
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
            id=role.id or 0,
            name=role.name,
            description=role.description,
        )
        for role in roles
    ]
