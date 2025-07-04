import asyncio
from datetime import datetime
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db.models import User
from app.db.session import get_session
from app.main import app
from app.routers.auth_router import get_current_user


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
    with Session(engine) as session:
        yield session
        session.rollback()


@pytest.fixture(scope="function")
def test_user():
    """Test user fixture."""
    return User(
        id=1,
        email="test@example.com",
        password_hash="test_hash",
        is_verified=True,
        created_at=datetime.utcnow(),
    )


@pytest.fixture
def client(session, test_user):
    """Create a test client for FastAPI app."""
    # Set up dependency overrides for testing
    app.dependency_overrides[get_session] = lambda: session
    app.dependency_overrides[get_current_user] = lambda: test_user

    # Create the test client
    with TestClient(app) as client:
        yield client

    # Clear dependency overrides after test
    app.dependency_overrides.clear()
