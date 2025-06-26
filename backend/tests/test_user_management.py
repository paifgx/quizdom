"""Tests for user management API endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def admin_user(client):
    """Create an admin user for testing."""
    # This would typically use a test database
    # For now, we'll test the API structure
    return {"email": "admin@test.com", "password": "admin123", "role": "admin"}


def test_user_stats_endpoint_requires_auth(client: TestClient):
    """Test that user stats endpoint requires authentication."""
    response = client.get("/admin/users/stats")
    assert response.status_code == 401


def test_list_users_endpoint_requires_auth(client: TestClient):
    """Test that list users endpoint requires authentication."""
    response = client.get("/admin/users")
    assert response.status_code == 401


def test_create_user_endpoint_requires_auth(client: TestClient):
    """Test that create user endpoint requires authentication."""
    response = client.post(
        "/admin/users",
        json={
            "email": "test@example.com",
            "password": "password123",
            "is_verified": False,
        },
    )
    assert response.status_code == 401


def test_update_user_endpoint_requires_auth(client: TestClient):
    """Test that update user endpoint requires authentication."""
    response = client.put("/admin/users/1", json={"email": "updated@example.com"})
    assert response.status_code == 401


def test_delete_user_endpoint_requires_auth(client: TestClient):
    """Test that delete user endpoint requires authentication."""
    response = client.delete("/admin/users/1")
    assert response.status_code == 401


def test_roles_endpoint_requires_auth(client: TestClient):
    """Test that roles endpoint requires authentication."""
    response = client.get("/admin/roles")
    assert response.status_code == 401


def test_user_management_endpoints_exist(client: TestClient):
    """Test that all user management endpoints are registered."""
    # Test that endpoints exist (even if they return 401)
    endpoints_to_test = [
        ("/admin/users/stats", "GET"),
        ("/admin/users", "GET"),
        ("/admin/users", "POST"),
        ("/admin/users/1", "GET"),
        ("/admin/users/1", "PUT"),
        ("/admin/users/1/status", "PUT"),
        ("/admin/users/1", "DELETE"),
        ("/admin/roles", "GET"),
    ]

    for endpoint, method in endpoints_to_test:
        if method == "GET":
            response = client.get(endpoint)
        elif method == "POST":
            response = client.post(endpoint, json={})
        elif method == "PUT":
            response = client.put(endpoint, json={})
        elif method == "DELETE":
            response = client.delete(endpoint)

        # Should not return 404 (endpoint exists) or 405 (method not allowed)
        assert response.status_code not in [
            404,
            405,
        ], f"Endpoint {method} {endpoint} not found or method not allowed"
