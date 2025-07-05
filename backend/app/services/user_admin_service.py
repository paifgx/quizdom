"""User administration service for managing users.

Provides business logic for admin operations on user accounts,
including CRUD operations, role management, and statistics.
"""

from datetime import datetime, timedelta
from typing import Any, Optional, Tuple

from sqlalchemy import and_, select as sa_select, text
from sqlmodel import Session, select

from app.db.models import Role, SessionPlayers, User, UserRoles
from app.schemas.user import UserListItemResponse, UserStatsResponse


class UserAdminService:
    """Service for admin user management operations."""

    def __init__(self, session: Session):
        """Initialize with database session.

        Args:
            session: Database session
        """
        self.session = session

    def build_user_list_response(self, user: User) -> UserListItemResponse:
        """Build a response object for a user in a list.

        Args:
            user: The user model to convert

        Returns:
            UserListItemResponse: User data for list display
        """
        if user.id is None:
            raise ValueError("User ID cannot be None")

        # Get role name
        role_name = self.get_user_role(user.id)

        # Get quiz statistics
        quizzes_completed, average_score, total_score = self.calculate_user_quiz_stats(
            user.id
        )

        # TODO: Get last login from sessions table when implemented
        last_login = None

        return UserListItemResponse(
            id=user.id,
            email=user.email,
            is_verified=user.is_verified,
            created_at=user.created_at,
            deleted_at=user.deleted_at,
            role_name=role_name,
            last_login=last_login,
            quizzes_completed=quizzes_completed,
            average_score=average_score,
            total_score=total_score,
        )

    def get_user_role(self, user_id: int) -> Optional[str]:
        """Get the role name for a user.

        Args:
            user_id: The user ID

        Returns:
            str or None: Role name if found, None otherwise
        """
        stmt = text(
            "SELECT r.name FROM role r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = :user_id"
        )
        result = self.session.execute(stmt, {"user_id": user_id}).first()

        if result:
            return result[0]
        return None

    def calculate_user_quiz_stats(self, user_id: int) -> Tuple[int, float, int]:
        """Calculate quiz statistics for a user.

        Args:
            user_id: The user ID

        Returns:
            Tuple containing:
            - Number of quizzes completed
            - Average score
            - Total score
        """
        # Get completed sessions for this user
        stmt = text("SELECT score FROM session_players WHERE user_id = :user_id")
        results = self.session.execute(stmt, {"user_id": user_id}).fetchall()

        if not results:
            return 0, 0.0, 0

        # Calculate statistics
        completed = len(results)
        scores = [row[0] or 0 for row in results]
        total_score = sum(scores)
        average_score = total_score / completed if completed > 0 else 0.0

        return completed, average_score, total_score

    def get_user_statistics(self) -> UserStatsResponse:
        """Get aggregate statistics about users.

        Returns:
            UserStatsResponse: User statistics
        """
        # Use plain SQL to avoid SQLModel typing issues

        # Total users
        total_users = (
            self.session.execute(text("SELECT COUNT(*) FROM user")).scalar() or 0
        )

        # Active users (not deleted)
        active_users = (
            self.session.execute(
                text("SELECT COUNT(*) FROM user WHERE deleted_at IS NULL")
            ).scalar()
            or 0
        )

        # Verified users
        verified_users = (
            self.session.execute(
                text("SELECT COUNT(*) FROM user WHERE is_verified = 1")
            ).scalar()
            or 0
        )

        # Admin users
        admin_users = (
            self.session.execute(
                text(
                    """
                SELECT COUNT(DISTINCT u.id)
                FROM user u
                JOIN user_roles ur ON u.id = ur.user_id
                JOIN role r ON ur.role_id = r.id
                WHERE r.name = 'admin'
            """
                )
            ).scalar()
            or 0
        )

        # Recent registrations (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_registrations = (
            self.session.execute(
                text("SELECT COUNT(*) FROM user WHERE created_at >= :cutoff"),
                {"cutoff": seven_days_ago},
            ).scalar()
            or 0
        )

        # New users this month
        first_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
        new_users_this_month = (
            self.session.execute(
                text("SELECT COUNT(*) FROM user WHERE created_at >= :cutoff"),
                {"cutoff": first_of_month},
            ).scalar()
            or 0
        )

        return UserStatsResponse(
            total_users=total_users,
            active_users=active_users,
            verified_users=verified_users,
            admin_users=admin_users,
            recent_registrations=recent_registrations,
            new_users_this_month=new_users_this_month,
        )
