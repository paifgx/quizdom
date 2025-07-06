"""Unit tests for User Admin Service."""

from datetime import datetime
from typing import Generator, cast
from unittest.mock import MagicMock

import pytest
from sqlalchemy import StaticPool, create_engine
from sqlmodel import Session, SQLModel

from app.db.models import Role, User, UserRoles
from app.services.user_admin_service import UserAdminService


@pytest.fixture
def session() -> Generator[Session, None, None]:
    """Create a new database session for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def user_admin_service(session: Session):
    """User admin service fixture."""
    return UserAdminService(session)


@pytest.fixture
def sample_users(session: Session):
    """Create sample users for testing."""
    # Create roles
    admin_role = Role(name="admin", description="Administrator")
    user_role = Role(name="user", description="Regular User")
    session.add(admin_role)
    session.add(user_role)
    session.commit()
    session.refresh(admin_role)
    session.refresh(user_role)

    # Create users
    admin_user = User(
        email="admin@example.com",
        password_hash="admin_hash",
        is_verified=True,
        created_at=datetime.utcnow(),
    )
    regular_user = User(
        email="user@example.com",
        password_hash="user_hash",
        is_verified=True,
        created_at=datetime.utcnow(),
    )
    inactive_user = User(
        email="inactive@example.com",
        password_hash="inactive_hash",
        is_verified=False,
        created_at=datetime.utcnow(),
        deleted_at=datetime.utcnow(),
    )
    session.add(admin_user)
    session.add(regular_user)
    session.add(inactive_user)
    session.commit()
    session.refresh(admin_user)
    session.refresh(regular_user)
    session.refresh(inactive_user)

    # Assign roles
    admin_user_role = UserRoles(
        user_id=cast(int, admin_user.id),
        role_id=cast(int, admin_role.id),
        granted_at=datetime.utcnow(),
    )
    regular_user_role = UserRoles(
        user_id=cast(int, regular_user.id),
        role_id=cast(int, user_role.id),
        granted_at=datetime.utcnow(),
    )
    session.add_all([admin_user_role, regular_user_role])
    session.commit()

    return [admin_user, regular_user, inactive_user]


def test_build_user_list_response(
    user_admin_service: UserAdminService, sample_users: list[User], session: Session
):
    """Test building user list response."""
    # Get a user with role for testing
    admin_user = sample_users[0]

    # Call the service method
    result = user_admin_service.build_user_list_response(admin_user)

    # Verify the response
    assert result.id == admin_user.id
    assert result.email == admin_user.email
    assert result.is_verified == admin_user.is_verified
    assert result.created_at == admin_user.created_at
    assert result.role_name == "admin"
    assert result.quizzes_completed == 0
    assert result.total_score == 0


def test_get_user_role(user_admin_service: UserAdminService, sample_users: list[User]):
    """Test getting user role."""
    # Test admin user
    admin_user = sample_users[0]
    role_name = user_admin_service.get_user_role(cast(int, admin_user.id))
    assert role_name == "admin"

    # Test regular user
    regular_user = sample_users[1]
    role_name = user_admin_service.get_user_role(cast(int, regular_user.id))
    assert role_name == "user"

    # Test user with no role
    inactive_user = sample_users[2]
    role_name = user_admin_service.get_user_role(cast(int, inactive_user.id))
    assert role_name is None

    # Test non-existent user
    role_name = user_admin_service.get_user_role(999)
    assert role_name is None


def test_get_user_statistics(
    user_admin_service: UserAdminService, sample_users: list[User]
):
    """Test getting user statistics."""
    # Call the service method
    stats = user_admin_service.get_user_statistics()

    # Verify statistics
    assert stats.total_users == 3
    assert stats.active_users == 2  # Two users without deleted_at
    assert stats.verified_users == 2  # Two users with is_verified=True
    assert stats.admin_users == 1  # One admin user
    assert stats.recent_registrations >= 0
    assert stats.new_users_this_month >= 0


def test_calculate_user_quiz_stats(
    user_admin_service: UserAdminService, sample_users: list[User], session: Session
):
    """Test calculating user quiz statistics."""
    # Mock quiz session data
    user_id = cast(int, sample_users[0].id)

    # Mock direct SQL execution instead of using exec
    session.execute = MagicMock(
        return_value=MagicMock(fetchall=MagicMock(return_value=[(80,), (90,), (100,)]))
    )

    # Call the service method
    completed, avg_score, total = user_admin_service.calculate_user_quiz_stats(user_id)

    # Verify results
    assert completed == 3
    assert avg_score == 90.0
    assert total == 270
