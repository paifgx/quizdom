"""Authentication service for user profile operations.

Handles profile retrieval, updates, and soft deletion with proper
validation and business logic.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.logging import app_logger, log_operation
from app.db.models import (
    AuditLogs,
    RefreshToken,
    Role,
    SessionPlayers,
    User,
    UserRoles,
    Wallet,
)
from app.schemas.auth import UserProfileResponse, UserProfileUpdate, UserStats


class AuthService:
    """Service for authentication and profile operations."""

    def __init__(self, session: Session):
        """Initialize with database session.

        Args:
            session: Database session
        """
        self.session = session

    def get_user_profile(self, user: User) -> UserProfileResponse:
        """Get complete user profile with stats.

        Args:
            user: User model instance

        Returns:
            UserProfileResponse: Complete profile data

        Raises:
            HTTPException: If user account is deleted
        """
        if user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benutzerprofil nicht gefunden",
            )

        if user.id is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Benutzer-ID fehlt",
            )

        # Get user role
        role_name = self._get_user_role_name(user.id)

        # Get user wisecoins
        wisecoins = self._get_user_wisecoins(user.id)

        # Get user stats
        stats = self._get_user_stats(user.id)

        return UserProfileResponse(
            id=user.id,
            email=user.email,
            nickname=user.nickname,
            avatar_url=user.avatar_url,
            bio=user.bio,
            role=role_name or "player",
            wisecoins=wisecoins,
            created_at=user.created_at,
            stats=stats,
        )

    def update_user_profile(
        self, user_id: int, update_data: UserProfileUpdate
    ) -> UserProfileResponse:
        """Update user profile with whitelist fields.

        Args:
            user_id: User ID to update
            update_data: Profile update data

        Returns:
            UserProfileResponse: Updated profile data

        Raises:
            HTTPException: If user not found, deleted, or nickname taken
        """
        # Get user
        user = self.session.get(User, user_id)
        if not user or user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benutzerprofil nicht gefunden",
            )

        # Check nickname uniqueness if provided
        if update_data.nickname is not None:
            existing = self.session.exec(
                select(User).where(
                    User.nickname == update_data.nickname,
                    User.id != user_id,
                    User.deleted_at == None,  # noqa: E711
                )
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Nickname bereits vergeben",
                    headers={
                        "X-Error-Code": "nickname_taken",
                        "X-Error-Field": "nickname",
                    },
                )

        # Update only allowed fields
        if update_data.nickname is not None:
            user.nickname = update_data.nickname
        if update_data.avatar_url is not None:
            user.avatar_url = update_data.avatar_url
        if update_data.bio is not None:
            user.bio = update_data.bio

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        log_operation(
            app_logger,
            "user_profile_updated",
            user_id=user_id,
            updated_fields=[
                k for k, v in update_data.model_dump(exclude_unset=True).items()
            ],
        )

        return self.get_user_profile(user)

    def soft_delete_user(self, user_id: int) -> None:
        """Soft delete user account and revoke all tokens.

        Args:
            user_id: User ID to delete

        Raises:
            HTTPException: If user not found or already deleted
        """
        # Get user
        user = self.session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benutzer nicht gefunden",
            )

        if user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Benutzer bereits gelöscht",
            )

        # Set deletion timestamp
        now = datetime.now(timezone.utc)
        user.deleted_at = now

        # Revoke all refresh tokens
        refresh_tokens = self.session.exec(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at == None,  # noqa: E711
            )
        ).all()

        for token in refresh_tokens:
            token.revoked_at = now

        # Create audit log
        audit_log = AuditLogs(
            actor_id=user_id,
            target_id=user_id,
            action="user.soft_delete",
            meta={"deleted_at": now.isoformat()},
            created_at=now,
        )
        self.session.add(audit_log)

        # Commit all changes
        self.session.commit()

        log_operation(
            app_logger,
            "user_soft_deleted",
            user_id=user_id,
            tokens_revoked=len(refresh_tokens),
        )

    def _get_user_role_name(self, user_id: int) -> Optional[str]:
        """Get user role name from UserRoles table.

        Args:
            user_id: User ID

        Returns:
            Optional[str]: Role name or None
        """
        statement = (
            select(Role.name)
            .join(UserRoles)
            .where(UserRoles.role_id == Role.id)
            .where(UserRoles.user_id == user_id)
        )
        return self.session.exec(statement).first()

    def _get_user_wisecoins(self, user_id: int) -> int:
        """Get user wisecoin balance.

        Args:
            user_id: User ID

        Returns:
            int: Wisecoin balance (0 if no wallet)
        """
        wallet = self.session.exec(
            select(Wallet).where(Wallet.user_id == user_id)
        ).first()
        return wallet.wisecoins if wallet else 0

    def _get_user_stats(self, user_id: int) -> UserStats:
        """Calculate user quiz statistics.

        Args:
            user_id: User ID

        Returns:
            UserStats: User statistics
        """
        # Get all game sessions for user
        sessions = self.session.exec(
            select(SessionPlayers).where(SessionPlayers.user_id == user_id)
        ).all()

        if not sessions:
            return UserStats(
                quizzes_completed=0,
                average_score=0.0,
                total_score=0,
            )

        quizzes_completed = len(sessions)
        total_score = sum(s.score for s in sessions)
        average_score = (
            total_score / quizzes_completed if quizzes_completed > 0 else 0.0
        )

        return UserStats(
            quizzes_completed=quizzes_completed,
            average_score=round(average_score, 2),
            total_score=total_score,
        )
