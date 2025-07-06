"""Authentication schemas for request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """Request schema for user registration."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")


class UserStats(BaseModel):
    """User statistics for profile display."""

    quizzes_completed: int = Field(0, description="Number of quizzes completed")
    average_score: float = Field(0.0, description="Average quiz score")
    total_score: int = Field(0, description="Total score earned")


class UserResponse(BaseModel):
    """Response schema for user data."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    is_verified: bool = Field(..., description="Whether user email is verified")
    role_id: Optional[int] = Field(None, description="User role ID")
    role_name: Optional[str] = Field(None, description="User role name")


class UserProfileResponse(BaseModel):
    """Response schema for user profile data."""

    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email address")
    nickname: Optional[str] = Field(None, description="User nickname")
    avatar_url: Optional[str] = Field(None, description="User avatar URL")
    bio: Optional[str] = Field(None, description="User biography")
    role: str = Field(..., description="User role name")
    wisecoins: int = Field(0, description="User wisecoin balance")
    created_at: datetime = Field(..., description="Account creation date")
    stats: UserStats = Field(..., description="User statistics")


class UserProfileUpdate(BaseModel):
    """Request schema for updating user profile."""

    nickname: Optional[str] = Field(None, description="New nickname")
    avatar_url: Optional[str] = Field(None, description="New avatar URL")
    bio: Optional[str] = Field(None, description="New biography")


class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")


class AuthErrorResponse(BaseModel):
    """Response schema for authentication errors."""

    detail: str = Field(..., description="Error message")
    code: str = Field(..., description="Error code")
    field: Optional[str] = Field(None, description="Field that caused the error")
