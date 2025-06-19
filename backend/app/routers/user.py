from app.db.models import User
from app.db.session import get_session
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

router = APIRouter()


@router.get("/{user_id}", response_model=User)
def read_user(user_id: int, db: Session = Depends(get_session)):
    """Get a user by ID."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
