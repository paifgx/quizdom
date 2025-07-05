"""User management router for admin operations.

This module provides endpoints for administrators to manage users,
including creating, reading, updating, and deleting user accounts.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlmodel import Session, select

from app.core.dependencies import require_admin
from app.db.helpers import build_user_list_response
from app.db.models import Role, SessionPlayers, User, UserRoles
from app.db.session import get_session
from app.schemas.user import (
    UserListResponse,
    UserStatsResponse,
)

router = APIRouter(prefix="/v1/users", tags=["users"])


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
    total = session.exec(select(func.count()).select_from(User)).one()
    users_db = session.exec(select(User).offset(skip).limit(limit)).all()

    # Convert User models to UserListItemResponse objects using helper
    users = []
    for user in users_db:
        # Get role information
        role_query = (
            select(Role.name)
            .join(UserRoles)
            .where(UserRoles.role_id == Role.id)
            .where(UserRoles.user_id == user.id)
        )
        role_name = session.exec(role_query).first()

        # Use helper function to build response
        user_response = build_user_list_response(session, user, role_name)
        users.append(user_response)

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
    total_users = session.exec(select(func.count()).select_from(User)).one()

    # Get verified users count
    verified_users = session.exec(
        select(func.count()).where(User.is_verified)).one()

    # Get recent registrations (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_registrations = session.exec(
        select(func.count()).where(User.created_at >= seven_days_ago)
    ).one()

    # Get active users (users who have played games)
    active_users = session.exec(
        select(func.count(func.distinct(SessionPlayers.user_id))).select_from(
            SessionPlayers
        )
    ).one()

    # Get admin users count
    admin_users_query = (
        select(func.count(func.distinct(UserRoles.user_id)))
        .select_from(UserRoles)
        .join(Role)
        .where(UserRoles.role_id == Role.id)
        .where(Role.name == "admin")
    )
    admin_users = session.exec(admin_users_query).one()

    # Get new users this month
    first_of_month = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0)
    new_users_this_month = session.exec(
        select(func.count()).where(User.created_at >= first_of_month)
    ).one()

    return UserStatsResponse(
        total_users=total_users,
        verified_users=verified_users,
        recent_registrations=recent_registrations,
        active_users=active_users,
        admin_users=admin_users,
        new_users_this_month=new_users_this_month,
    )
