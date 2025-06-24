"""Authentication schemas for request/response validation."""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserLoginRequest(BaseModel):
    """Request schema for user login."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")


class UserRegisterRequest(BaseModel):
    """Request schema for user registration."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")


class UserResponse(BaseModel):
    """Response schema for user data."""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    nickname: Optional[str] = Field(None, description="User nickname")
    is_verified: bool = Field(..., description="Whether user email is verified")


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
