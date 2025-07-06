"""Integration tests for auth endpoints."""

from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.security import create_access_token, get_password_hash
from app.db.models import RefreshToken, Role, User, UserRoles, Wallet
from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def test_user(session: Session):
    """Create a test user with authentication."""
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("password123"),
        nickname="TestUser",
        avatar_url="https://example.com/avatar.jpg",
        bio="Test bio",
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create wallet
    assert user.id is not None
    wallet = Wallet(user_id=user.id, wisecoins=100)
    session.add(wallet)

    # Create role
    player_role = Role(name="player", description="Player")
    session.add(player_role)
    session.commit()
    session.refresh(player_role)

    # Assign role
    assert player_role.id is not None
    user_role = UserRoles(
        user_id=user.id,
        role_id=player_role.id,
        granted_at=datetime.now(timezone.utc),
    )
    session.add(user_role)
    session.commit()

    return user


@pytest.fixture
def auth_headers(test_user: User):
    """Create authentication headers."""
    token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}


class TestGetProfile:
    """Test GET /v1/auth/me endpoint."""

    def test_get_profile_success(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test successful profile retrieval."""
        response = client.get("/v1/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == test_user.id
        assert data["email"] == test_user.email
        assert data["nickname"] == test_user.nickname
        assert data["avatar_url"] == test_user.avatar_url
        assert data["bio"] == test_user.bio
        assert data["role"] == "player"
        assert data["wisecoins"] == 100
        assert "stats" in data
        assert data["stats"]["quizzes_completed"] == 0
        assert data["stats"]["average_score"] == 0.0
        assert data["stats"]["total_score"] == 0

    def test_get_profile_unauthenticated(self, client: TestClient):
        """Test profile retrieval without authentication."""
        response = client.get("/v1/auth/me")

        assert response.status_code == 401
        assert "detail" in response.json()

    def test_get_profile_deleted_user(
        self, client: TestClient, test_user: User, auth_headers: dict, session: Session
    ):
        """Test profile retrieval for deleted user."""
        # Mark user as deleted
        test_user.deleted_at = datetime.now(timezone.utc)
        session.add(test_user)
        session.commit()

        response = client.get("/v1/auth/me", headers=auth_headers)

        assert response.status_code == 401
        assert "Account wurde gelöscht" in response.json()["detail"]

    def test_get_profile_invalid_token(self, client: TestClient):
        """Test profile retrieval with invalid token."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/v1/auth/me", headers=headers)

        assert response.status_code == 401


class TestUpdateProfile:
    """Test PUT /v1/auth/me endpoint."""

    def test_update_profile_success(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test successful profile update."""
        update_data = {
            "nickname": "NewNickname",
            "avatar_url": "https://example.com/new-avatar.jpg",
            "bio": "New bio text",
        }

        response = client.put(
            "/v1/auth/me", json=update_data, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["nickname"] == "NewNickname"
        assert data["avatar_url"] == "https://example.com/new-avatar.jpg"
        assert data["bio"] == "New bio text"
        # Ensure other fields remain unchanged
        assert data["email"] == test_user.email
        assert data["wisecoins"] == 100

    def test_update_profile_partial(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test partial profile update."""
        update_data = {"nickname": "OnlyNickname"}

        response = client.put(
            "/v1/auth/me", json=update_data, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["nickname"] == "OnlyNickname"
        assert data["avatar_url"] == test_user.avatar_url  # Unchanged
        assert data["bio"] == test_user.bio  # Unchanged

    def test_update_profile_nickname_conflict(
        self, client: TestClient, test_user: User, auth_headers: dict, session: Session
    ):
        """Test update with conflicting nickname."""
        # Create another user with a nickname
        other_user = User(
            email="other@example.com",
            password_hash=get_password_hash("password"),
            nickname="TakenNickname",
        )
        session.add(other_user)
        session.commit()

        update_data = {"nickname": "TakenNickname"}

        response = client.put(
            "/v1/auth/me", json=update_data, headers=auth_headers)

        assert response.status_code == 409
        assert "Nickname bereits vergeben" in response.json()["detail"]
        assert response.headers.get("X-Error-Code") == "nickname_taken"
        assert response.headers.get("X-Error-Field") == "nickname"

    def test_update_profile_unauthenticated(self, client: TestClient):
        """Test profile update without authentication."""
        update_data = {"nickname": "NewNick"}

        response = client.put("/v1/auth/me", json=update_data)

        assert response.status_code == 401

    def test_update_profile_deleted_user(
        self, client: TestClient, test_user: User, auth_headers: dict, session: Session
    ):
        """Test profile update for deleted user."""
        # Mark user as deleted
        test_user.deleted_at = datetime.now(timezone.utc)
        session.add(test_user)
        session.commit()

        update_data = {"nickname": "NewNick"}

        response = client.put(
            "/v1/auth/me", json=update_data, headers=auth_headers)

        assert response.status_code == 401

    def test_update_profile_empty_fields(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test update with empty/null fields."""
        update_data = {
            "nickname": None,
            "avatar_url": None,
            "bio": None,
        }

        response = client.put(
            "/v1/auth/me", json=update_data, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Fields should remain unchanged when null is sent
        assert data["nickname"] == test_user.nickname
        assert data["avatar_url"] == test_user.avatar_url
        assert data["bio"] == test_user.bio


class TestDeleteProfile:
    """Test DELETE /v1/auth/me endpoint."""

    def test_delete_profile_success(
        self, client: TestClient, test_user: User, auth_headers: dict, session: Session
    ):
        """Test successful profile deletion."""
        # Add refresh tokens
        assert test_user.id is not None
        token1 = RefreshToken(
            user_id=test_user.id,
            token_hash="hash1",
            issued_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc),
        )
        token2 = RefreshToken(
            user_id=test_user.id,
            token_hash="hash2",
            issued_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc),
        )
        session.add(token1)
        session.add(token2)
        session.commit()

        response = client.delete("/v1/auth/me", headers=auth_headers)

        assert response.status_code == 204
        assert response.content == b""  # No content

        # Verify user is marked as deleted
        session.refresh(test_user)
        assert test_user.deleted_at is not None

        # Verify tokens are revoked
        session.refresh(token1)
        session.refresh(token2)
        assert token1.revoked_at is not None
        assert token2.revoked_at is not None

        # Verify subsequent GET returns 401
        response = client.get("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 401

    def test_delete_profile_unauthenticated(self, client: TestClient):
        """Test profile deletion without authentication."""
        response = client.delete("/v1/auth/me")

        assert response.status_code == 401

    def test_delete_profile_already_deleted(
        self, client: TestClient, test_user: User, auth_headers: dict, session: Session
    ):
        """Test deletion of already deleted profile."""
        # Mark user as deleted
        test_user.deleted_at = datetime.now(timezone.utc)
        session.add(test_user)
        session.commit()

        response = client.delete("/v1/auth/me", headers=auth_headers)

        assert response.status_code == 401

    def test_delete_profile_subsequent_login_fails(
        self, client: TestClient, test_user: User, auth_headers: dict, session: Session
    ):
        """Test that login fails after account deletion."""
        # Delete the account
        response = client.delete("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 204

        # Try to login
        login_data = {
            "username": test_user.email,  # OAuth2 form uses 'username'
            "password": "password123",
        }

        response = client.post(
            "/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        # Login should fail for deleted account
        assert response.status_code == 401


class TestEndToEndFlow:
    """Test complete user profile flow."""

    def test_complete_profile_flow(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test complete flow: get -> update -> delete."""
        # 1. Get initial profile
        response = client.get("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        initial_data = response.json()

        # 2. Update profile
        update_data = {
            "nickname": "UpdatedUser",
            "avatar_url": "https://example.com/updated.jpg",
            "bio": "Updated bio",
        }
        response = client.put(
            "/v1/auth/me", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        updated_data = response.json()

        assert updated_data["nickname"] == "UpdatedUser"
        assert updated_data["avatar_url"] == "https://example.com/updated.jpg"
        assert updated_data["bio"] == "Updated bio"

        # 3. Get updated profile
        response = client.get("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == updated_data

        # 4. Delete profile
        response = client.delete("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 204

        # 5. Verify deletion
        response = client.get("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 401
