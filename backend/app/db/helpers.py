"""Database helper functions to reduce code duplication.

This module contains reusable database query patterns used across
multiple endpoints to maintain DRY principles.
"""

from datetime import datetime
from typing import Optional, Tuple

from sqlmodel import Session, func, select

from app.db.models import GameSession, Role, User
from app.schemas.user import UserListResponse


def get_user_with_role_name(
    session: Session, user_id: int
) -> Optional[Tuple[User, Optional[str]]]:
    """Get user with role name by user ID.

    Returns user and role name tuple, or None if user not found.
    Used across multiple user management endpoints.
    """
    result = session.exec(
        select(User, Role.name).outerjoin(Role).where(User.id == user_id)
    ).first()

    return result


def get_user_quiz_statistics(session: Session, user_id: int) -> dict:
    """Get user quiz statistics including completed quizzes and scores.

    Returns dictionary with quiz completion stats and scoring information.
    Used across multiple user endpoints to avoid query duplication.
    """
    quiz_stats = session.exec(
        select(
            func.count(GameSession.id).label("quizzes_completed"),
            func.coalesce(func.avg(GameSession.score), 0).label("average_score"),
            func.coalesce(func.sum(GameSession.score), 0).label("total_score"),
        ).where(GameSession.user_id == user_id)
    ).first()

    if not quiz_stats:
        return {
            "quizzes_completed": 0,
            "average_score": 0.0,
            "total_score": 0,
        }

    # quiz_stats is a tuple: (count, avg, sum)
    count_val, avg_val, sum_val = quiz_stats

    return {
        "quizzes_completed": count_val or 0,
        "average_score": float(avg_val) if avg_val else 0.0,
        "total_score": sum_val or 0,
    }


def get_user_last_session(session: Session, user_id: int) -> Optional[datetime]:
    """Get user's last game session timestamp.

    Returns the timestamp of the most recent game session.
    Used to show last login information across user endpoints.
    """
    last_session = session.exec(
        select(GameSession.started_at)
        .where(GameSession.user_id == user_id)
        .order_by(GameSession.started_at.desc())
        .limit(1)
    ).first()

    return last_session


def validate_role_exists(session: Session, role_id: int) -> bool:
    """Validate that a role ID exists in the database.

    Returns True if role exists, False otherwise.
    Used for role validation across user management endpoints.
    """
    role = session.exec(select(Role).where(Role.id == role_id)).first()
    return role is not None


def check_email_available(
    session: Session, email: str, exclude_user_id: Optional[int] = None
) -> bool:
    """Check if email is available for use.

    Returns True if email is available, False if already taken.
    Optionally excludes a specific user ID for update operations.
    """
    query = select(User).where(User.email == email)

    if exclude_user_id:
        query = query.where(User.id != exclude_user_id)

    existing_user = session.exec(query).first()
    return existing_user is None


def build_user_list_response(
    session: Session, user: User, role_name: Optional[str] = None
) -> UserListResponse:
    """Build a complete UserListResponse with statistics.

    Creates a UserListResponse object with all required data including
    quiz statistics and last session information.
    """
    if not user.id:
        raise ValueError("User ID is required")

    quiz_stats = get_user_quiz_statistics(session, user.id)
    last_session = get_user_last_session(session, user.id)

    return UserListResponse(
        id=user.id,
        email=user.email,
        is_verified=user.is_verified,
        created_at=user.created_at,
        deleted_at=user.deleted_at,
        role_name=role_name,
        last_login=last_session,
        quizzes_completed=quiz_stats["quizzes_completed"],
        average_score=quiz_stats["average_score"],
        total_score=quiz_stats["total_score"],
    )
