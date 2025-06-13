from fastapi import APIRouter

router = APIRouter()


@router.get("/question")
def get_question():
    """Placeholder endpoint for getting a quiz question."""
    return {"question": "What is 2 + 2?"}
