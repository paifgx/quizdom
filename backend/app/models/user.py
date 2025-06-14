from datetime import datetime, UTC
from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import EmailStr, constr
import uuid

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True)
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)
    failed_login_attempts: int = Field(default=0)
    last_failed_login: Optional[datetime] = None
    verification_token: Optional[str] = None
    verification_token_expires: Optional[datetime] = None
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None

class User(UserBase, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

class UserCreate(SQLModel):
    email: EmailStr
    password: constr(min_length=12)
    password_confirm: str

class UserResponse(SQLModel):
    id: uuid.UUID
    email: EmailStr
    is_verified: bool
    created_at: datetime 