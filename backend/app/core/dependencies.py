"""Shared dependencies for FastAPI routers.

This module contains common dependency functions used across
multiple routers to maintain DRY principles.
"""

from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.logging import app_logger, log_operation
from app.db.models import Role, User, UserRoles
from app.db.session import get_session
from app.routers.auth_router import get_current_user


def require_admin(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> User:
    """Require admin role for accessing endpoints.

    Verifies that the current user has admin privileges.
    Used as a dependency for admin-only endpoints.

    Args:
        current_user: The authenticated user from token
        session: Database session dependency

    Returns:
        User: The authenticated admin user

    Raises:
        HTTPException: When user doesn't have admin role
    """
    # Check if user has admin role through UserRoles
    admin_role = session.exec(
        select(Role)
        .join(UserRoles)
        .where(UserRoles.role_id == Role.id)
        .where(UserRoles.user_id == current_user.id)
        .where(Role.name == "admin")
    ).first()

    if not admin_role:
        log_operation(app_logger, "admin_access_denied",
                      user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator-Zugriff erforderlich",
            headers={
                "X-Error-Code": "admin_required",
                "X-Error-Hint": "Sie benötigen Administrator-Rechte für diese Operation",
            },
        )

    return current_user
