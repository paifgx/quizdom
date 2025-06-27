"""Security utilities for authentication and authorization.

This module provides secure password hashing and JWT token management
following industry best practices and the project's security requirements.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings

# WHY: Explicit bcrypt configuration prevents deprecated scheme usage
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,  # WHY: Higher rounds for better security
)

SECRET_KEY = getattr(settings, "secret_key", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15


class TokenData(BaseModel):
    """Token payload data.

    Contains the validated data extracted from JWT tokens.
    Used for user identification in protected endpoints.
    """

    email: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash.

    Uses bcrypt for secure password verification.
    Returns True if password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash.

    Creates a secure bcrypt hash of the provided password.
    Used during user registration and password updates.
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token.

    Generates a signed JWT token with user data and expiration.
    Used for stateless authentication across API requests.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def verify_token(token: str) -> Optional[TokenData]:
    """Verify and decode JWT token.

    Validates the token signature and extracts user data.
    Returns None if token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None or not isinstance(email, str):
            return None

        token_data = TokenData(email=email)
        return token_data

    except JWTError:
        return None
