"""User management schemas for admin operations."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserListResponse(BaseModel):
    """Response schema for user list."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    is_verified: bool = Field(..., description="Whether user email is verified")
    created_at: datetime = Field(..., description="User registration date")
    deleted_at: Optional[datetime] = Field(None, description="User deletion date")
    role_name: Optional[str] = Field(None, description="User role name")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    quizzes_completed: int = Field(0, description="Number of quizzes completed")
    average_score: float = Field(0.0, description="Average quiz score")
    total_score: int = Field(0, description="Total score earned")


class UserUpdateRequest(BaseModel):
    """Request schema for updating user."""

    email: Optional[EmailStr] = Field(None, description="New email address")
    is_verified: Optional[bool] = Field(None, description="Verification status")
    role_id: Optional[int] = Field(None, description="New role ID")


class UserStatusUpdateRequest(BaseModel):
    """Request schema for updating user status."""

    deleted_at: Optional[datetime] = Field(
        None, description="Deletion timestamp (null to restore)"
    )


class UserCreateRequest(BaseModel):
    """Request schema for creating a new user."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")
    role_id: Optional[int] = Field(None, description="User role ID")
    is_verified: bool = Field(False, description="Email verification status")


class UserStatsResponse(BaseModel):
    """Response schema for user statistics."""

    total_users: int = Field(..., description="Total number of users")
    active_users: int = Field(..., description="Number of active users")
    admin_users: int = Field(..., description="Number of admin users")
    verified_users: int = Field(..., description="Number of verified users")
    new_users_this_month: int = Field(..., description="New users this month")


class RoleResponse(BaseModel):
    """Response schema for role data."""

    id: int = Field(..., description="Role ID")
    name: str = Field(..., description="Role name")
    description: Optional[str] = Field(None, description="Role description")
