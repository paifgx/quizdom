"""Admin router for quiz management."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from starlette import status

from app.db.models import User
from app.db.session import get_session
from app.routers.user import require_admin
from app.schemas.quiz_admin import (
    QuestionCreate,
    QuestionResponse,
    QuestionUpdate,
    QuizCreate,
    QuizDetailResponse,
    QuizResponse,
    QuizUpdate,
    TopicCreate,
    TopicResponse,
    TopicUpdate,
)
from app.services.quiz_admin_service import QuizAdminService

router = APIRouter(prefix="/v1/admin", tags=["admin"])


# Topic endpoints
@router.get("/topics", response_model=List[TopicResponse])
async def get_topics(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Get all topics."""
    service = QuizAdminService(db)
    return service.get_topics(skip=skip, limit=limit)


@router.get("/topics/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Get a single topic by ID."""
    service = QuizAdminService(db)
    topic = service.get_topic(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thema nicht gefunden"
        )
    return topic


@router.post(
    "/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED
)
async def create_topic(
    topic_data: TopicCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Create a new topic."""
    service = QuizAdminService(db)
    return service.create_topic(topic_data)


@router.put("/topics/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: int,
    topic_data: TopicUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Update an existing topic."""
    service = QuizAdminService(db)
    topic = service.update_topic(topic_id, topic_data)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thema nicht gefunden"
        )
    return topic


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Delete a topic."""
    service = QuizAdminService(db)
    try:
        success = service.delete_topic(topic_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Thema nicht gefunden"
            )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Question endpoints
@router.get("/questions", response_model=List[QuestionResponse])
async def get_questions(
    skip: int = 0,
    limit: int = 100,
    topic_id: Optional[int] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Get all questions with optional topic filter."""
    service = QuizAdminService(db)
    return service.get_questions(skip=skip, limit=limit, topic_id=topic_id)


@router.get("/questions/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Get a single question by ID."""
    service = QuizAdminService(db)
    question = service.get_question(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Frage nicht gefunden"
        )
    return question


@router.post(
    "/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED
)
async def create_question(
    question_data: QuestionCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Create a new question with answers."""
    service = QuizAdminService(db)
    try:
        return service.create_question(question_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Update an existing question."""
    service = QuizAdminService(db)
    question = service.update_question(question_id, question_data)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Frage nicht gefunden"
        )
    return question


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Delete a question."""
    service = QuizAdminService(db)
    try:
        success = service.delete_question(question_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Frage nicht gefunden"
            )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Quiz endpoints
@router.get("/quizzes", response_model=List[QuizResponse])
async def get_quizzes(
    skip: int = 0,
    limit: int = 100,
    topic_id: Optional[int] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Get all quizzes with optional topic filter."""
    service = QuizAdminService(db)
    return service.get_quizzes(skip=skip, limit=limit, topic_id=topic_id)


@router.get("/quizzes/{quiz_id}", response_model=QuizDetailResponse)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Get a single quiz by ID with questions."""
    service = QuizAdminService(db)
    quiz = service.get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz nicht gefunden"
        )
    return quiz


@router.post(
    "/quizzes", response_model=QuizDetailResponse, status_code=status.HTTP_201_CREATED
)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Create a new quiz with questions."""
    service = QuizAdminService(db)
    try:
        return service.create_quiz(quiz_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/quizzes/{quiz_id}", response_model=QuizDetailResponse)
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Update an existing quiz."""
    service = QuizAdminService(db)
    quiz = service.update_quiz(quiz_id, quiz_data)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz nicht gefunden"
        )
    return quiz


@router.delete("/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Delete a quiz."""
    service = QuizAdminService(db)
    success = service.delete_quiz(quiz_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz nicht gefunden"
        )
