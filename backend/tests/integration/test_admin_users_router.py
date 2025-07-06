"""Integration tests for admin user router endpoints."""

from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlmodel import Session

from app.db.models import User


def test_list_users_empty(admin_client: TestClient, admin_user: User, session: Session):
    """Test listing users when only admin exists."""
    # Delete all users except admin
    session.execute(
        text("DELETE FROM userroles WHERE user_id != :admin_id"),
        {"admin_id": admin_user.id},
    )
    session.execute(
        text("DELETE FROM user WHERE id != :admin_id"), {"admin_id": admin_user.id}
    )
    session.commit()

    # Call the endpoint
    response = admin_client.get("/v1/admin/users?limit=100")

    # Verify response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1  # Only admin user remains
    assert data["skip"] == 0
    assert data["limit"] == 100
    assert len(data["data"]) == 1
    assert data["data"][0]["email"] == admin_user.email


def test_list_users_with_data(
    admin_client: TestClient, admin_user: User, regular_user: User, test_user: User
):
    """Test listing users with populated data."""
    # Call the endpoint
    response = admin_client.get("/v1/admin/users?limit=10")

    # Verify response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 3  # at least admin_user + regular_user + test_user
    assert len(data["data"]) >= 3

    # Check that all expected users are in the response
    emails = [user["email"] for user in data["data"]]
    assert "admin@example.com" in emails
    assert "user@example.com" in emails
    assert "test@example.com" in emails


def test_list_users_pagination(
    admin_client: TestClient, admin_user: User, regular_user: User, test_user: User
):
    """Test user listing pagination."""
    # First page (limit 1, skip 0)
    response = admin_client.get("/v1/admin/users?limit=1&skip=0")
    data = response.json()
    assert len(data["data"]) == 1
    assert data["skip"] == 0
    assert data["limit"] == 1

    # Second page (limit 1, skip 1)
    response = admin_client.get("/v1/admin/users?limit=1&skip=1")
    data = response.json()
    assert len(data["data"]) == 1
    assert data["skip"] == 1
    assert data["limit"] == 1

    # Skip all users
    response = admin_client.get("/v1/admin/users?limit=10&skip=10")
    data = response.json()
    assert len(data["data"]) == 0


def test_create_user(admin_client: TestClient, session: Session):
    """Test creating a new user."""
    import uuid

    # Ensure regular user role exists
    from app.db.models import Role

    user_role = session.get(Role, 2)
    if not user_role:
        user_role = Role(id=2, name="user", description="Regular User")
        session.add(user_role)
        session.commit()

    # Create user data with unique email
    unique_email = f"new_{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": unique_email,
        "password": "newpass123",
        "role_id": 2,  # Regular user role
        "is_verified": True,
    }

    # Call the endpoint
    response = admin_client.post("/v1/admin/users", json=user_data)

    # Verify response
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == unique_email
    assert data["is_verified"] is True
    assert "id" in data
    assert "password" not in data  # Password should not be returned

    # Verify user was created in database
    stmt = text("SELECT * FROM user WHERE email = :email")
    result = session.execute(stmt, {"email": unique_email}).first()
    assert result is not None
    created_user_id = result[0]
    assert result[6] == 1  # is_verified (SQLite stores boolean as 0/1)

    # Verify role assignment
    stmt = text("SELECT * FROM userroles WHERE user_id = :user_id")
    result = session.execute(stmt, {"user_id": created_user_id}).first()
    assert result is not None
    assert result[1] == 2  # role_id


def test_update_user(admin_client: TestClient, regular_user: User, session: Session):
    """Test updating an existing user."""
    # Update data
    update_data = {
        "email": "updated@example.com",
        "is_verified": False,
    }

    # Call the endpoint
    response = admin_client.put(f"/v1/admin/users/{regular_user.id}", json=update_data)

    # Verify response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "updated@example.com"
    assert data["is_verified"] is False

    # Verify user was updated in database
    session.refresh(regular_user)
    assert regular_user.email == "updated@example.com"
    assert regular_user.is_verified is False


def test_delete_user(admin_client: TestClient, regular_user: User, session: Session):
    """Test deleting a user (hard delete)."""
    # Call the endpoint
    response = admin_client.delete(f"/v1/admin/users/{regular_user.id}")

    # Verify response
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify user was hard-deleted (completely removed from database)
    stmt = text("SELECT COUNT(*) FROM user WHERE id = :user_id")
    result = session.execute(stmt, {"user_id": regular_user.id}).scalar()
    assert result == 0


def test_get_user_stats(admin_client: TestClient):
    """Test retrieving user statistics."""
    # Call the endpoint
    response = admin_client.get("/v1/admin/users/stats")

    # Verify response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_users" in data
    assert "active_users" in data
    assert "verified_users" in data
    assert "admin_users" in data
    assert "recent_registrations" in data


def test_access_denied_for_regular_users(regular_client: TestClient):
    """Test that regular users cannot access admin endpoints."""
    # Try to list users
    response = regular_client.get("/v1/admin/users")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    # Try to create user
    response = regular_client.post(
        "/v1/admin/users", json={"email": "test@example.com", "password": "test123"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    # Try to get user stats
    response = regular_client.get("/v1/admin/users/stats")
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_invalid_input_validation(admin_client: TestClient):
    """Test input validation for admin endpoints."""
    # Invalid email format
    response = admin_client.post(
        "/v1/admin/users",
        json={"email": "invalid-email", "password": "valid123", "role_id": 2},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Password too short
    response = admin_client.post(
        "/v1/admin/users",
        json={"email": "valid@example.com", "password": "short", "role_id": 2},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Invalid role_id (non-integer)
    response = admin_client.post(
        "/v1/admin/users",
        json={
            "email": "valid@example.com",
            "password": "valid123",
            "role_id": "not-a-number",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
