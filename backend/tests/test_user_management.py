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
    return {"email": "admin@test.com", "password": "admin123", "role": "admin"}


def test_user_stats_endpoint_requires_auth(client: TestClient):
    """Test that user stats endpoint requires authentication."""
    response = client.get("/v1/users/stats")
    assert response.status_code == 401


def test_list_users_endpoint_requires_auth(client: TestClient):
    """Test that list users endpoint requires authentication."""
    response = client.get("/v1/users")
    assert response.status_code == 401


def test_user_management_endpoints_exist(client: TestClient):
    """Test that all user management endpoints are registered."""
    endpoints_to_test = [
        ("/v1/users/stats", "GET"),
        ("/v1/users", "GET"),
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
