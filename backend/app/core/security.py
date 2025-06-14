from datetime import datetime, timedelta, UTC
import secrets
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import re

ph = PasswordHasher()

def verify_password_strength(password: str) -> bool:
    """Verify password meets security requirements."""
    if len(password) < 12:
        return False
    
    has_upper = bool(re.search(r'[A-Z]', password))
    has_lower = bool(re.search(r'[a-z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
    
    return all([has_upper, has_lower, has_digit, has_special])

def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False

def generate_verification_token() -> str:
    """Generate a secure verification token."""
    return secrets.token_urlsafe(32)

def get_token_expiry(hours: int = 24) -> datetime:
    """Get token expiry datetime."""
    return datetime.now(UTC) + timedelta(hours=hours) 