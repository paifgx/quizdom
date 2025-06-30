"""User management router for admin operations.

This module provides endpoints for administrators to manage users,
including creating, reading, updating, and deleting user accounts.
"""

from datetime import datetime, timezone, timedelta

from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.core.logging import app_logger, log_operation
from app.db.models import Role, SessionPlayers, User, UserRoles
from app.db.session import get_session
from app.routers.auth_router import get_current_user
from app.schemas.user import (
    UserListResponse,
    UserStatsResponse,
)

router = APIRouter(prefix="/v1/users", tags=["users"])


def require_admin(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> User:
    """Require admin role for accessing endpoints.

    Verifies that the current user has admin privileges.
    Used as a dependency for admin-only endpoints.

    Args:
        current_user: The authenticated user from token
        session: Database session dependency

    Returns:
        User: The authenticated admin user

    Raises:
        HTTPException: When user doesn't have admin role
    """
    # Check if user has admin role through UserRoles
    admin_role = session.exec(
        select(Role)
        .join(UserRoles, Role.id == UserRoles.role_id)
        .where(UserRoles.user_id == current_user.id)
        .where(Role.name == "admin")
    ).first()

    if not admin_role:
        log_operation(app_logger, "admin_access_denied", user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator-Zugriff erforderlich",
            headers={
                "X-Error-Code": "admin_required",
                "X-Error-Hint": "Sie benötigen Administrator-Rechte für diese Operation",
            },
        )

    return current_user


@router.get("/", response_model=UserListResponse)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> UserListResponse:
    """List all users with pagination.

    Args:
        skip: Number of users to skip
        limit: Maximum number of users to return
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        UserListResponse: List of users with pagination metadata
    """
    total = session.exec(select(func.count(User.id))).one()
    users = session.exec(
        select(User).offset(skip).limit(limit).order_by(User.created_at)
    ).all()

    return UserListResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=users,
    )


@router.get("/stats", response_model=UserStatsResponse)
def get_user_stats(
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> UserStatsResponse:
    """Get user statistics.

    Args:
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        UserStatsResponse: User statistics
    """
    # Get total users
    total_users = session.exec(select(func.count(User.id))).one()

    # Get verified users count
    verified_users = session.exec(
        select(func.count(User.id)).where(User.is_verified)
    ).one()

    # Get recent registrations (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_registrations = session.exec(
        select(func.count(User.id)).where(User.created_at >= seven_days_ago)
    ).one()

    # Get active users (users who have played games)
    active_users = session.exec(
        select(func.count(func.distinct(SessionPlayers.user_id)))
    ).one()

    return UserStatsResponse(
        total_users=total_users,
        verified_users=verified_users,
        recent_registrations=recent_registrations,
        active_users=active_users,
    )
