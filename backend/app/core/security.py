from datetime import datetime, timedelta
from typing import Any

from argon2 import PasswordHasher
from jose import jwt

from app.core.config import settings

ph = PasswordHasher(time_cost=4, memory_cost=65536, parallelism=2)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    return ph.hash(password)
