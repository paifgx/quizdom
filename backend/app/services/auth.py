from __future__ import annotations

from datetime import datetime, timedelta
from hashlib import sha256
from os import urandom

from sqlmodel import Session, select

from app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.db.models import LoginAttempt, RefreshToken, Role, User, UserRole

REFRESH_TOKEN_EXPIRE_DAYS = 7


def register_user(db: Session, email: str, password: str, nickname: str) -> User:
    """Create a new user with the 'player' role."""
    if db.exec(select(User).where(User.email == email)).first():
        raise ValueError("email exists")

    user = User(
        email=email, password_hash=get_password_hash(password), nickname=nickname
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    role = db.exec(select(Role).where(Role.name == "player")).first()
    if not role:
        role = Role(name="player")
        db.add(role)
        db.commit()
        db.refresh(role)
    db.add(UserRole(user_id=user.id, role_id=role.id))
    db.commit()
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.exec(select(User).where(User.email == email)).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None


def create_refresh_token(db: Session, user_id: int) -> str:
    raw = urandom(32).hex()
    token_hash = sha256(raw.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(RefreshToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at))
    db.commit()
    return raw


def get_valid_refresh_token(db: Session, raw: str) -> RefreshToken | None:
    token_hash = sha256(raw.encode()).hexdigest()
    return db.exec(
        select(RefreshToken)
        .where(RefreshToken.token_hash == token_hash)
        .where(RefreshToken.revoked_at.is_(None))
        .where(RefreshToken.expires_at > datetime.utcnow())
    ).first()


def rotate_refresh_token(db: Session, token: RefreshToken) -> str:
    token.revoked_at = datetime.utcnow()
    db.add(token)
    db.commit()
    return create_refresh_token(db, token.user_id)


def record_login_attempt(db: Session, user_id: int | None, success: bool) -> None:
    db.add(LoginAttempt(user_id=user_id, ip="0.0.0.0", success=success))
    db.commit()


def too_many_failures(db: Session, user_id: int) -> bool:
    cutoff = datetime.utcnow() - timedelta(minutes=15)
    failures = db.exec(
        select(LoginAttempt)
        .where(LoginAttempt.user_id == user_id)
        .where(LoginAttempt.attempted_at > cutoff)
        .where(LoginAttempt.success.is_(False))
    ).all()
    return len(failures) >= 3


def create_token_pair(db: Session, user_id: int) -> tuple[str, str]:
    access = create_access_token(str(user_id))
    refresh = create_refresh_token(db, user_id)
    return access, refresh
