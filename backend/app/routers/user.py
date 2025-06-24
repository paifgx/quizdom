from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.db.models import User
from app.db.session import get_session
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/{user_id}", response_model=User)
def read_user(user_id: int, db: Session = Depends(get_session)):
    """Get a user by ID."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/me", response_model=User)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the currently authenticated user."""
    return current_user


class UserUpdate(BaseModel):
    nickname: str


@router.patch("/me", response_model=User)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> User:
    current_user.nickname = data.nickname
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=204)
def delete_me(
    db: Session = Depends(get_session), current_user: User = Depends(get_current_user)
) -> None:
    current_user.deleted_at = datetime.utcnow()
    db.add(current_user)
    db.commit()
    return None
