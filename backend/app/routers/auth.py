from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
def login():
    """Placeholder login endpoint."""
    return {"message": "login"}


@router.post("/register")
def register():
    """Placeholder register endpoint."""
    return {"message": "register"}
