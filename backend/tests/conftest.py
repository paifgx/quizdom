import asyncio
from datetime import datetime
from typing import Generator, cast

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db.models import Role, User, UserRoles, Wallet
from app.db.session import get_session
from app.main import app
from app.routers.auth_router import get_current_user
from app.core.security import get_password_hash


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def engine():
    """Create a SQLAlchemy engine instance for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine


@pytest.fixture(scope="function")
def session(engine) -> Generator[Session, None, None]:
    """Create a SQLAlchemy session for a test."""
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture
def test_user(session: Session) -> User:
    """Test user fixture."""
    user = User(
        id=3,
        email="test@example.com",
        password_hash=get_password_hash("password123"),
        is_verified=True,
        created_at=datetime.utcnow(),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    assert user.id is not None
    wallet = Wallet(user_id=user.id, wisecoins=100)
    session.add(wallet)

    # Create player role if it doesn't exist
    from sqlmodel import select

    player_role = session.exec(select(Role).where(Role.name == "player")).first()
    if not player_role:
        player_role = Role(name="player", description="Player")
        session.add(player_role)
        session.commit()
        session.refresh(player_role)

    # Assign role to user
    assert player_role.id is not None
    user_role = UserRoles(user_id=user.id, role_id=player_role.id)
    session.add(user_role)
    session.commit()

    return user


@pytest.fixture
def client(session: Session, test_user: User) -> Generator[TestClient, None, None]:
    """Create a test client for FastAPI app."""

    def get_session_override():
        return session

    def get_current_user_override():
        return session.get(User, test_user.id)

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(session: Session) -> User:
    """Create admin user and role for testing."""
    admin_role = Role(id=1, name="admin", description="Administrator")
    session.add(admin_role)
    session.commit()
    session.refresh(admin_role)

    admin = User(
        id=1,
        email="admin@example.com",
        password_hash="admin_hash",
        is_verified=True,
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)

    admin_user_role = UserRoles(
        user_id=cast(int, admin.id), role_id=cast(int, admin_role.id)
    )
    session.add(admin_user_role)
    session.commit()
    return admin


@pytest.fixture
def regular_user(session: Session) -> User:
    """Create regular user for testing."""
    user_role = Role(id=2, name="user", description="Regular User")
    session.add(user_role)
    session.commit()
    session.refresh(user_role)

    user = User(
        id=2,
        email="user@example.com",
        password_hash="user_hash",
        is_verified=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    user_user_role = UserRoles(
        user_id=cast(int, user.id), role_id=cast(int, user_role.id)
    )
    session.add(user_user_role)
    session.commit()
    return user


@pytest.fixture
def admin_client(
    session: Session,
    admin_user: User,
) -> Generator[TestClient, None, None]:
    """Create client with admin authentication."""

    def get_session_override():
        return session

    def get_current_user_override():
        return admin_user

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def regular_client(
    session: Session,
    regular_user: User,
) -> Generator[TestClient, None, None]:
    """Create client with regular user authentication."""

    def get_session_override():
        return session

    def get_current_user_override():
        return regular_user

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
