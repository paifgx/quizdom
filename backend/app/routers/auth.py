from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

from app.core.security import create_access_token
from app.db.models import User
from app.db.session import get_session
from app.services import auth as auth_service

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nickname: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_session)) -> TokenPair:
    try:
        user = auth_service.register_user(db, data.email, data.password, data.nickname)
    except ValueError:
        raise HTTPException(status_code=400, detail="Email already registered")

    access, refresh = auth_service.create_token_pair(db, user.id)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_session)) -> TokenPair:
    user = auth_service.authenticate_user(db, data.email, data.password)
    if not user:
        auth_service.record_login_attempt(db, None, False)
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if auth_service.too_many_failures(db, user.id):
        raise HTTPException(status_code=429, detail="Account locked")

    auth_service.record_login_attempt(db, user.id, True)
    access, refresh = auth_service.create_token_pair(db, user.id)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh")
def refresh(data: RefreshRequest, db: Session = Depends(get_session)) -> TokenPair:
    token = auth_service.get_valid_refresh_token(db, data.refresh_token)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    new_refresh = auth_service.rotate_refresh_token(db, token)
    access = create_access_token(str(token.user_id))
    return TokenPair(access_token=access, refresh_token=new_refresh)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: RefreshRequest, db: Session = Depends(get_session)) -> None:
    token = auth_service.get_valid_refresh_token(db, data.refresh_token)
    if token:
        token.revoked_at = datetime.utcnow()
        db.add(token)
        db.commit()
    return None
