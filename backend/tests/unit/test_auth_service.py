"""Unit tests for AuthService."""

from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
from sqlmodel import Session, create_engine, select
from sqlmodel.pool import StaticPool

from app.db.models import (
    AuditLogs,
    RefreshToken,
    Role,
    SessionPlayers,
    SQLModel,
    User,
    UserRoles,
    Wallet,
)
from app.schemas.auth import UserProfileUpdate, UserStats
from app.services.auth_service import AuthService


@pytest.fixture
def session():
    """Create in-memory test database session."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture
def sample_user(session: Session):
    """Create a sample user for testing."""
    user = User(
        email="test@example.com",
        password_hash="hashed_password",
        nickname="TestUser",
        avatar_url="https://example.com/avatar.jpg",
        bio="Test bio",
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def sample_role(session: Session):
    """Create sample roles."""
    admin_role = Role(name="admin", description="Administrator")
    player_role = Role(name="player", description="Player")
    session.add(admin_role)
    session.add(player_role)
    session.commit()
    session.refresh(admin_role)
    session.refresh(player_role)
    return admin_role, player_role


@pytest.fixture
def sample_user_with_role(session: Session, sample_user: User, sample_role):
    """Create user with role assignment."""
    _, player_role = sample_role
    assert sample_user.id is not None
    assert player_role.id is not None
    user_role = UserRoles(
        user_id=sample_user.id,
        role_id=player_role.id,
        granted_at=datetime.now(timezone.utc),
    )
    session.add(user_role)
    session.commit()
    return sample_user


@pytest.fixture
def sample_user_with_wallet(session: Session, sample_user: User):
    """Create user with wallet."""
    assert sample_user.id is not None
    wallet = Wallet(user_id=sample_user.id, wisecoins=100)
    session.add(wallet)
    session.commit()
    return sample_user


@pytest.fixture
def auth_service(session: Session):
    """Create AuthService instance."""
    return AuthService(session)


class TestGetUserProfile:
    """Test get_user_profile method."""

    def test_get_profile_success(
        self, auth_service: AuthService, sample_user_with_role: User, session: Session
    ):
        """Test successful profile retrieval."""
        # Add wallet for complete test
        assert sample_user_with_role.id is not None
        wallet = Wallet(user_id=sample_user_with_role.id, wisecoins=150)
        session.add(wallet)
        session.commit()

        profile = auth_service.get_user_profile(sample_user_with_role)

        assert profile.id == sample_user_with_role.id
        assert profile.email == sample_user_with_role.email
        assert profile.nickname == sample_user_with_role.nickname
        assert profile.avatar_url == sample_user_with_role.avatar_url
        assert profile.bio == sample_user_with_role.bio
        assert profile.role == "player"
        assert profile.wisecoins == 150
        assert isinstance(profile.stats, UserStats)

    def test_get_profile_deleted_user(
        self, auth_service: AuthService, session: Session
    ):
        """Test profile retrieval for deleted user."""
        deleted_user = User(
            email="deleted@example.com",
            password_hash="hash",
            deleted_at=datetime.now(timezone.utc),
        )
        session.add(deleted_user)
        session.commit()

        with pytest.raises(HTTPException) as exc_info:
            auth_service.get_user_profile(deleted_user)

        assert exc_info.value.status_code == 404
        assert "Benutzerprofil nicht gefunden" in str(exc_info.value.detail)

    def test_get_profile_no_role(
        self, auth_service: AuthService, sample_user: User, session: Session
    ):
        """Test profile retrieval for user without role."""
        profile = auth_service.get_user_profile(sample_user)
        assert profile.role == "player"  # Default role

    def test_get_profile_no_wallet(self, auth_service: AuthService, sample_user: User):
        """Test profile retrieval for user without wallet."""
        profile = auth_service.get_user_profile(sample_user)
        assert profile.wisecoins == 0  # Default wisecoins

    def test_get_profile_with_game_stats(
        self, auth_service: AuthService, sample_user: User, session: Session
    ):
        """Test profile retrieval with game statistics."""
        # Add game sessions - each with a different session_id
        assert sample_user.id is not None
        scores = [100, 200, 150]
        for i, score in enumerate(scores):
            player = SessionPlayers(
                session_id=i + 1,  # Different session IDs
                user_id=sample_user.id,
                hearts_left=3,
                score=score,
            )
            session.add(player)
        session.commit()

        profile = auth_service.get_user_profile(sample_user)

        assert profile.stats.quizzes_completed == 3
        assert profile.stats.total_score == 450
        assert profile.stats.average_score == 150.0


class TestUpdateUserProfile:
    """Test update_user_profile method."""

    def test_update_profile_success(self, auth_service: AuthService, sample_user: User):
        """Test successful profile update."""
        assert sample_user.id is not None
        update_data = UserProfileUpdate(
            nickname="NewNickname",
            avatar_url="https://example.com/new-avatar.jpg",
            bio="New bio text",
        )

        profile = auth_service.update_user_profile(sample_user.id, update_data)

        assert profile.nickname == "NewNickname"
        assert profile.avatar_url == "https://example.com/new-avatar.jpg"
        assert profile.bio == "New bio text"

    def test_update_profile_partial(self, auth_service: AuthService, sample_user: User):
        """Test partial profile update."""
        assert sample_user.id is not None
        update_data = UserProfileUpdate(
            nickname="OnlyNickname", avatar_url=None, bio=None
        )

        profile = auth_service.update_user_profile(sample_user.id, update_data)

        assert profile.nickname == "OnlyNickname"
        assert profile.avatar_url == sample_user.avatar_url  # Unchanged
        assert profile.bio == sample_user.bio  # Unchanged

    def test_update_profile_nickname_taken(
        self, auth_service: AuthService, sample_user: User, session: Session
    ):
        """Test update with already taken nickname."""
        # Create another user with a nickname
        other_user = User(
            email="other@example.com",
            password_hash="hash",
            nickname="TakenNickname",
        )
        session.add(other_user)
        session.commit()

        assert sample_user.id is not None
        update_data = UserProfileUpdate(
            nickname="TakenNickname", avatar_url=None, bio=None
        )

        with pytest.raises(HTTPException) as exc_info:
            auth_service.update_user_profile(sample_user.id, update_data)

        assert exc_info.value.status_code == 409
        assert "Nickname bereits vergeben" in str(exc_info.value.detail)

    def test_update_profile_user_not_found(self, auth_service: AuthService):
        """Test update for non-existent user."""
        update_data = UserProfileUpdate(nickname="NewNick", avatar_url=None, bio=None)

        with pytest.raises(HTTPException) as exc_info:
            auth_service.update_user_profile(9999, update_data)

        assert exc_info.value.status_code == 404

    def test_update_profile_deleted_user(
        self, auth_service: AuthService, sample_user: User, session: Session
    ):
        """Test update for deleted user."""
        sample_user.deleted_at = datetime.now(timezone.utc)
        session.add(sample_user)
        session.commit()

        assert sample_user.id is not None
        update_data = UserProfileUpdate(nickname="NewNick", avatar_url=None, bio=None)

        with pytest.raises(HTTPException) as exc_info:
            auth_service.update_user_profile(sample_user.id, update_data)

        assert exc_info.value.status_code == 404


class TestSoftDeleteUser:
    """Test soft_delete_user method."""

    def test_soft_delete_success(
        self, auth_service: AuthService, sample_user: User, session: Session
    ):
        """Test successful soft delete."""
        # Add refresh tokens
        assert sample_user.id is not None
        token1 = RefreshToken(
            user_id=sample_user.id,
            token_hash="hash1",
            issued_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc),
        )
        token2 = RefreshToken(
            user_id=sample_user.id,
            token_hash="hash2",
            issued_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc),
        )
        session.add(token1)
        session.add(token2)
        session.commit()

        # Perform soft delete
        auth_service.soft_delete_user(sample_user.id)

        # Verify user is marked as deleted
        session.refresh(sample_user)
        assert sample_user.deleted_at is not None

        # Verify tokens are revoked
        session.refresh(token1)
        session.refresh(token2)
        assert token1.revoked_at is not None
        assert token2.revoked_at is not None

        # Verify audit log created
        audit_log = session.exec(
            select(AuditLogs).where(AuditLogs.action == "user.soft_delete")
        ).first()
        assert audit_log is not None
        assert audit_log.actor_id == sample_user.id
        assert audit_log.target_id == sample_user.id

    def test_soft_delete_user_not_found(self, auth_service: AuthService):
        """Test soft delete for non-existent user."""
        with pytest.raises(HTTPException) as exc_info:
            auth_service.soft_delete_user(9999)

        assert exc_info.value.status_code == 404
        assert "Benutzer nicht gefunden" in str(exc_info.value.detail)

    def test_soft_delete_already_deleted(
        self, auth_service: AuthService, sample_user: User, session: Session
    ):
        """Test soft delete for already deleted user."""
        sample_user.deleted_at = datetime.now(timezone.utc)
        session.add(sample_user)
        session.commit()

        assert sample_user.id is not None
        with pytest.raises(HTTPException) as exc_info:
            auth_service.soft_delete_user(sample_user.id)

        assert exc_info.value.status_code == 400
        assert "Benutzer bereits gelöscht" in str(exc_info.value.detail)

    def test_soft_delete_no_tokens(
        self, auth_service: AuthService, sample_user: User, session: Session
    ):
        """Test soft delete when user has no tokens."""
        assert sample_user.id is not None
        auth_service.soft_delete_user(sample_user.id)

        session.refresh(sample_user)
        assert sample_user.deleted_at is not None


class TestHelperMethods:
    """Test private helper methods."""

    def test_get_user_role_name(
        self, auth_service: AuthService, sample_user_with_role: User
    ):
        """Test _get_user_role_name method."""
        assert sample_user_with_role.id is not None
        role_name = auth_service._get_user_role_name(sample_user_with_role.id)
        assert role_name == "player"

    def test_get_user_role_name_no_role(
        self, auth_service: AuthService, sample_user: User
    ):
        """Test _get_user_role_name when user has no role."""
        assert sample_user.id is not None
        role_name = auth_service._get_user_role_name(sample_user.id)
        assert role_name is None

    def test_get_user_wisecoins(
        self, auth_service: AuthService, sample_user_with_wallet: User
    ):
        """Test _get_user_wisecoins method."""
        assert sample_user_with_wallet.id is not None
        wisecoins = auth_service._get_user_wisecoins(sample_user_with_wallet.id)
        assert wisecoins == 100

    def test_get_user_wisecoins_no_wallet(
        self, auth_service: AuthService, sample_user: User
    ):
        """Test _get_user_wisecoins when user has no wallet."""
        assert sample_user.id is not None
        wisecoins = auth_service._get_user_wisecoins(sample_user.id)
        assert wisecoins == 0

    def test_get_user_stats_with_sessions(
        self, auth_service: AuthService, sample_user: User, session: Session
    ):
        """Test _get_user_stats with game sessions."""
        # Add multiple sessions
        assert sample_user.id is not None
        scores = [100, 200, 150, 300, 250]
        for i, score in enumerate(scores):
            player = SessionPlayers(
                session_id=i + 1,
                user_id=sample_user.id,
                hearts_left=3,
                score=score,
            )
            session.add(player)
        session.commit()

        stats = auth_service._get_user_stats(sample_user.id)

        assert stats.quizzes_completed == 5
        assert stats.total_score == 1000
        assert stats.average_score == 200.0

    def test_get_user_stats_no_sessions(
        self, auth_service: AuthService, sample_user: User
    ):
        """Test _get_user_stats when user has no sessions."""
        assert sample_user.id is not None
        stats = auth_service._get_user_stats(sample_user.id)

        assert stats.quizzes_completed == 0
        assert stats.total_score == 0
        assert stats.average_score == 0.0
