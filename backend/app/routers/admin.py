from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select, delete

from app.dependencies import require_role
from app.db.session import get_session
from app.db.models import Role, User, UserRole

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[User])
def list_users(
    db: Session = Depends(get_session),
    _: User = Depends(require_role("admin")),
) -> list[User]:
    return db.exec(select(User).where(User.deleted_at.is_(None))).all()


class RoleUpdate(BaseModel):
    roles: list[str]


@router.patch("/users/{user_id}/roles", status_code=status.HTTP_204_NO_CONTENT)
def set_roles(
    user_id: int,
    data: RoleUpdate,
    db: Session = Depends(get_session),
    _: User = Depends(require_role("admin")),
) -> None:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.exec(delete(UserRole).where(UserRole.user_id == user_id))
    for name in data.roles:
        role = db.exec(select(Role).where(Role.name == name)).first()
        if not role:
            role = Role(name=name)
            db.add(role)
            db.commit()
            db.refresh(role)
        db.add(UserRole(user_id=user_id, role_id=role.id))
    db.commit()
    return None
