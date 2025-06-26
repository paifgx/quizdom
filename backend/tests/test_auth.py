"""Tests for authentication router."""

from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.security import create_access_token, get_password_hash
from app.db.models import Role, User
from app.db.session import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    """Create test database session."""
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create test client with test database."""

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(session: Session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpassword123"),
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def admin_role(session: Session):
    """Create admin role."""
    role = Role(name="admin", description="Administrator role")
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


@pytest.fixture
def admin_user(session: Session, admin_role: Role):
    """Create an admin user."""
    user = User(
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword123"),
        is_verified=True,
        role_id=admin_role.id,
        created_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


class TestUserRegistration:
    """Test user registration endpoint."""

    def test_register_new_user_success(self, client: TestClient):
        """Test successful user registration."""
        response = client.post(
            "/v1/auth/register",
            json={"email": "newuser@example.com", "password": "newpassword123"},
        )

        assert response.status_code == 200
        data = response.json()

        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == "newuser@example.com"
        assert data["user"]["is_verified"] is False
        assert data["user"]["role_id"] is None

    def test_register_existing_user_failure(self, client: TestClient, test_user: User):
        """Test registration with existing email fails."""
        response = client.post(
            "/v1/auth/register",
            json={"email": test_user.email, "password": "somepassword123"},
        )

        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_register_invalid_email(self, client: TestClient):
        """Test registration with invalid email format."""
        response = client.post(
            "/v1/auth/register",
            json={"email": "invalid-email", "password": "password123"},
        )

        assert response.status_code == 422

    def test_register_weak_password(self, client: TestClient):
        """Test registration with weak password."""
        response = client.post(
            "/v1/auth/register", json={"email": "test@example.com", "password": "123"}
        )

        assert response.status_code == 422


class TestUserLogin:
    """Test user login endpoint."""

    def test_login_success(self, client: TestClient, test_user: User):
        """Test successful user login."""
        response = client.post(
            "/v1/auth/login",
            data={"username": test_user.email, "password": "testpassword123"},
        )

        assert response.status_code == 200
        data = response.json()

        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == test_user.email

    def test_login_admin_user_with_role(self, client: TestClient, admin_user: User):
        """Test admin user login includes role information."""
        response = client.post(
            "/v1/auth/login",
            data={"username": admin_user.email, "password": "adminpassword123"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["user"]["email"] == admin_user.email
        assert data["user"]["role_name"] == "admin"
        assert data["user"]["role_id"] is not None

    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login with wrong password fails."""
        response = client.post(
            "/v1/auth/login",
            data={"username": test_user.email, "password": "wrongpassword"},
        )

        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with nonexistent user fails."""
        response = client.post(
            "/v1/auth/login",
            data={"username": "nonexistent@example.com", "password": "somepassword"},
        )

        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_missing_credentials(self, client: TestClient):
        """Test login with missing credentials."""
        response = client.post("/v1/auth/login", data={})

        assert response.status_code == 422


class TestCurrentUser:
    """Test current user endpoint."""

    def test_get_current_user_success(self, client: TestClient, test_user: User):
        """Test getting current user information."""
        token = create_access_token(data={"sub": test_user.email})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/v1/auth/me", headers=headers)

        assert response.status_code == 200
        data = response.json()

        assert data["email"] == test_user.email
        assert data["is_verified"] == test_user.is_verified
        assert data["id"] == test_user.id

    def test_get_current_user_with_role(self, client: TestClient, admin_user: User):
        """Test getting current user information with role."""
        token = create_access_token(data={"sub": admin_user.email})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/v1/auth/me", headers=headers)

        assert response.status_code == 200
        data = response.json()

        assert data["email"] == admin_user.email
        assert data["role_name"] == "admin"
        assert data["role_id"] is not None

    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token fails."""
        response = client.get("/v1/auth/me")

        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token fails."""
        headers = {"Authorization": "Bearer invalid_token"}

        response = client.get("/v1/auth/me", headers=headers)

        assert response.status_code == 401

    def test_get_current_user_expired_token(self, client: TestClient, test_user: User):
        """Test getting current user with expired token fails."""
        from datetime import timedelta

        # Create expired token
        token = create_access_token(
            data={"sub": test_user.email}, expires_delta=timedelta(seconds=-1)
        )
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/v1/auth/me", headers=headers)

        assert response.status_code == 401

    def test_get_current_user_nonexistent_user(self, client: TestClient):
        """Test getting current user when user no longer exists."""
        token = create_access_token(data={"sub": "nonexistent@example.com"})
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/v1/auth/me", headers=headers)

        assert response.status_code == 401


class TestAuthHelperFunctions:
    """Test authentication helper functions."""

    def test_get_user_by_email_success(self, session: Session, test_user: User):
        """Test getting user by email."""
        from app.routers.auth import get_user_by_email

        found_user = get_user_by_email(session, test_user.email)

        assert found_user is not None
        assert found_user.email == test_user.email
        assert found_user.id == test_user.id

    def test_get_user_by_email_not_found(self, session: Session):
        """Test getting user by email when user doesn't exist."""
        from app.routers.auth import get_user_by_email

        found_user = get_user_by_email(session, "nonexistent@example.com")

        assert found_user is None

    def test_get_user_with_role_no_role(self, session: Session, test_user: User):
        """Test getting user response without role."""
        from app.routers.auth import get_user_with_role

        user_response = get_user_with_role(session, test_user)

        assert user_response.email == test_user.email
        assert user_response.role_name is None
        assert user_response.role_id is None

    def test_get_user_with_role_with_role(self, session: Session, admin_user: User):
        """Test getting user response with role."""
        from app.routers.auth import get_user_with_role

        user_response = get_user_with_role(session, admin_user)

        assert user_response.email == admin_user.email
        assert user_response.role_name == "admin"
        assert user_response.role_id == admin_user.role_id
