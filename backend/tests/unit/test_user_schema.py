"""Unit tests for User Schemas."""

from datetime import datetime

import pytest
from pydantic import ValidationError

from app.schemas.user import (
    UserCreateRequest,
    UserListItemResponse,
    UserStatusUpdateRequest,
    UserUpdateRequest,
)


def test_user_create_request_validation():
    """Test UserCreateRequest schema validation."""
    # Valid data
    valid_data = {
        "email": "test@example.com",
        "password": "password123",
        "role_id": 1,
        "is_verified": True,
    }
    user = UserCreateRequest(**valid_data)
    assert user.email == "test@example.com"
    assert user.password == "password123"
    assert user.role_id == 1
    assert user.is_verified is True

    # Default values
    minimal_data = {
        "email": "test@example.com",
        "password": "password123",
        "role_id": None,
        "is_verified": False,
    }
    user = UserCreateRequest(**minimal_data)
    assert user.is_verified is False  # Default value from schema
    assert user.role_id is None  # Default value from schema

    # Email validation
    with pytest.raises(ValidationError):
        # Only required fields are passed, others use default values
        UserCreateRequest(
            email="invalid-email",
            password="password123",
            role_id=None,
            is_verified=False,
        )

    # Password minimum length
    with pytest.raises(ValidationError):
        # Only required fields are passed, others use default values
        UserCreateRequest(
            email="test@example.com",
            password="short",
            role_id=None,
            is_verified=False,
        )


def test_user_update_request_validation():
    """Test UserUpdateRequest schema validation."""
    # All fields optional
    empty_update = UserUpdateRequest(email=None, is_verified=None, role_id=None)
    assert empty_update.email is None
    assert empty_update.is_verified is None
    assert empty_update.role_id is None

    # Valid update
    valid_update = UserUpdateRequest(
        email="new@example.com", is_verified=True, role_id=2
    )
    assert valid_update.email == "new@example.com"
    assert valid_update.is_verified is True
    assert valid_update.role_id == 2

    # Email validation still applies
    with pytest.raises(ValidationError):
        # Other fields default to None
        UserUpdateRequest(email="invalid-email", is_verified=None, role_id=None)


def test_user_status_update_request_validation():
    """Test UserStatusUpdateRequest schema validation."""
    # Valid status update - set deletion timestamp
    now = datetime.utcnow()
    status_update = UserStatusUpdateRequest(deleted_at=now)
    assert status_update.deleted_at == now

    # Valid status update - restore user (undelete)
    restore_update = UserStatusUpdateRequest(deleted_at=None)
    assert restore_update.deleted_at is None

    # Empty is valid since deleted_at is optional
    empty_update = UserStatusUpdateRequest(deleted_at=None)
    assert empty_update.deleted_at is None


def test_user_list_item_response():
    """Test UserListItemResponse schema."""
    # Required fields
    now = datetime.utcnow()
    required_data = {
        "id": 1,
        "email": "test@example.com",
        "is_verified": True,
        "created_at": now,
    }
    user = UserListItemResponse(**required_data)
    assert user.id == 1
    assert user.email == "test@example.com"
    assert user.is_verified is True
    assert user.deleted_at is None
    assert user.role_name is None
    assert user.last_login is None
    assert user.quizzes_completed == 0
    assert user.average_score == 0.0
    assert user.total_score == 0

    # Complete data
    complete_data = {
        "id": 1,
        "email": "test@example.com",
        "is_verified": True,
        "created_at": now,
        "deleted_at": now,
        "role_name": "admin",
        "last_login": now,
        "quizzes_completed": 5,
        "average_score": 85.5,
        "total_score": 427,
    }
    user = UserListItemResponse(**complete_data)
    assert user.id == 1
    assert user.email == "test@example.com"
    assert user.role_name == "admin"
    assert user.quizzes_completed == 5
    assert user.average_score == 85.5
    assert user.total_score == 427
