"""Integration tests for auth endpoints."""

from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.security import create_access_token, get_password_hash
from app.db.models import RefreshToken, User
from app.main import app
from app.db.session import get_session


@pytest.fixture
def unauth_client(session: Session):
    """Create test client without authentication override."""
    # Save existing overrides
    existing_overrides = app.dependency_overrides.copy()

    # Clear all overrides
    app.dependency_overrides.clear()

    # Only set the session override
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override

    with TestClient(app) as c:
        yield c

    # Restore original overrides
    app.dependency_overrides = existing_overrides


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

    def test_get_profile_unauthenticated(self, unauth_client: TestClient):
        """Test profile retrieval without authentication."""
        response = unauth_client.get("/v1/auth/me")

        assert response.status_code == 401
        assert "detail" in response.json()

    def test_get_profile_deleted_user(
        self,
        unauth_client: TestClient,
        test_user: User,
        auth_headers: dict,
        session: Session,
    ):
        """Test profile retrieval for deleted user."""
        # Mark user as deleted
        test_user.deleted_at = datetime.now(timezone.utc)
        session.add(test_user)
        session.commit()

        response = unauth_client.get("/v1/auth/me", headers=auth_headers)

        assert response.status_code == 401
        assert "Account wurde gelöscht" in response.json()["detail"]

    def test_get_profile_invalid_token(self, unauth_client: TestClient):
        """Test profile retrieval with invalid token."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = unauth_client.get("/v1/auth/me", headers=headers)

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

        response = client.put("/v1/auth/me", json=update_data, headers=auth_headers)

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

        response = client.put("/v1/auth/me", json=update_data, headers=auth_headers)

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

        response = client.put("/v1/auth/me", json=update_data, headers=auth_headers)

        assert response.status_code == 409
        assert "Nickname bereits vergeben" in response.json()["detail"]
        assert response.headers.get("X-Error-Code") == "nickname_taken"
        assert response.headers.get("X-Error-Field") == "nickname"

    def test_update_profile_unauthenticated(self, unauth_client: TestClient):
        """Test profile update without authentication."""
        update_data = {"nickname": "NewNick"}

        response = unauth_client.put("/v1/auth/me", json=update_data)

        assert response.status_code == 401

    def test_update_profile_deleted_user(
        self,
        unauth_client: TestClient,
        test_user: User,
        auth_headers: dict,
        session: Session,
    ):
        """Test profile update for deleted user."""
        # Mark user as deleted
        test_user.deleted_at = datetime.now(timezone.utc)
        session.add(test_user)
        session.commit()

        update_data = {"nickname": "NewNick"}

        response = unauth_client.put(
            "/v1/auth/me", json=update_data, headers=auth_headers
        )

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

        response = client.put("/v1/auth/me", json=update_data, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Fields should remain unchanged when null is sent
        assert data["nickname"] == test_user.nickname
        assert data["avatar_url"] == test_user.avatar_url
        assert data["bio"] == test_user.bio


class TestDeleteProfile:
    """Test DELETE /v1/auth/me endpoint."""

    def test_delete_profile_success(
        self,
        unauth_client: TestClient,
        test_user: User,
        auth_headers: dict,
        session: Session,
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

        response = unauth_client.delete("/v1/auth/me", headers=auth_headers)

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
        response = unauth_client.get("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 401

    def test_delete_profile_unauthenticated(self, unauth_client: TestClient):
        """Test profile deletion without authentication."""
        response = unauth_client.delete("/v1/auth/me")

        assert response.status_code == 401

    def test_delete_profile_already_deleted(
        self,
        unauth_client: TestClient,
        test_user: User,
        auth_headers: dict,
        session: Session,
    ):
        """Test deletion of already deleted profile."""
        # Mark user as deleted
        test_user.deleted_at = datetime.now(timezone.utc)
        session.add(test_user)
        session.commit()

        response = unauth_client.delete("/v1/auth/me", headers=auth_headers)

        assert response.status_code == 401

    def test_delete_profile_subsequent_login_fails(
        self,
        unauth_client: TestClient,
        test_user: User,
        auth_headers: dict,
        session: Session,
    ):
        """Test that login fails after account deletion."""
        # Delete the account
        response = unauth_client.delete("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 204

        # Try to login
        login_data = {
            "username": test_user.email,  # OAuth2 form uses 'username'
            "password": "password123",
        }

        response = unauth_client.post(
            "/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        # Login should fail for deleted account
        assert response.status_code == 401


class TestEndToEndFlow:
    """Test complete user profile flow."""

    def test_complete_profile_flow(
        self,
        client: TestClient,
        unauth_client: TestClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Test complete flow: get -> update -> delete."""
        # 1. Get initial profile
        response = client.get("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200

        # 2. Update profile
        update_data = {
            "nickname": "UpdatedNickname",
            "avatar_url": "https://example.com/updated.jpg",
            "bio": "Updated bio",
        }
        response = client.put("/v1/auth/me", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        updated_data = response.json()

        assert updated_data["nickname"] == "UpdatedNickname"
        assert updated_data["avatar_url"] == "https://example.com/updated.jpg"
        assert updated_data["bio"] == "Updated bio"

        # 3. Get updated profile
        response = client.get("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == updated_data

        # 4. Delete profile
        response = unauth_client.delete("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 204

        # 5. Verify deletion
        response = unauth_client.get("/v1/auth/me", headers=auth_headers)
        assert response.status_code == 401
