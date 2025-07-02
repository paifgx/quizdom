"""Admin router for quiz management."""

import io
import logging
from typing import Any, List, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlmodel import Session
from starlette.responses import StreamingResponse

from app.db.models import Topic
from app.db.session import get_session
from app.schemas.quiz_admin import (
    ImageUploadResponse,
    QuestionCreate,
    QuestionResponse,
    QuestionUpdate,
    QuizBatchCreate,
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

logger = logging.getLogger(__name__)


# Topic endpoints
@router.get("/topics", response_model=List[TopicResponse])
async def get_topics(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session),
) -> List[Topic]:
    """Get all topics."""
    service = QuizAdminService(db)
    return service.get_topics(skip=skip, limit=limit)


@router.get("/topics/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: int,
    db: Session = Depends(get_session),
) -> Topic:
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
    db: Session = Depends(get_session),
) -> Topic:
    """Create a new topic."""
    service = QuizAdminService(db)
    return service.create_topic(topic_data)


@router.put("/topics/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: int,
    topic_data: TopicUpdate,
    db: Session = Depends(get_session),
) -> Topic:
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
    db: Session = Depends(get_session),
) -> None:
    """Delete a topic."""
    service = QuizAdminService(db)
    try:
        success = service.delete_topic(topic_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Thema nicht gefunden"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Question endpoints
@router.get("/questions", response_model=List[QuestionResponse])
async def get_questions(
    skip: int = 0,
    limit: int = 100,
    topic_id: Optional[int] = None,
    db: Session = Depends(get_session),
) -> List[dict[str, Any]]:
    """Get all questions with optional topic filter."""
    service = QuizAdminService(db)
    return service.get_questions(skip=skip, limit=limit, topic_id=topic_id)


@router.get("/questions/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    db: Session = Depends(get_session),
) -> Optional[dict[str, Any]]:
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
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Create a new question with answers."""
    service = QuizAdminService(db)
    try:
        return service.create_question(question_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_session),
) -> Optional[dict[str, Any]]:
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
    db: Session = Depends(get_session),
) -> None:
    """Delete a question."""
    service = QuizAdminService(db)
    try:
        success = service.delete_question(question_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Frage nicht gefunden"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/questions/batch",
    response_model=List[QuestionResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_questions_batch(
    questions_data: List[QuestionCreate],
    db: Session = Depends(get_session),
) -> List[dict[str, Any]]:
    """Create multiple questions in a single batch operation."""
    service = QuizAdminService(db)
    created_questions = []

    try:
        for question_data in questions_data:
            created_question = service.create_question(question_data)
            created_questions.append(created_question)

        return created_questions
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Quiz endpoints
@router.get("/quizzes", response_model=List[QuizResponse])
async def get_quizzes(
    skip: int = 0,
    limit: int = 100,
    topic_id: Optional[int] = None,
    db: Session = Depends(get_session),
) -> List[dict[str, Any]]:
    """Get all quizzes with optional topic filter."""
    service = QuizAdminService(db)
    return service.get_quizzes(skip=skip, limit=limit, topic_id=topic_id)


@router.get("/quizzes/published", response_model=List[QuizResponse])
async def get_published_quizzes(
    skip: int = 0,
    limit: int = 100,
    topic_id: Optional[int] = None,
    db: Session = Depends(get_session),
) -> List[dict[str, Any]]:
    """Get all published quizzes with optional topic filter."""
    service = QuizAdminService(db)
    return service.get_published_quizzes(skip=skip, limit=limit, topic_id=topic_id)


@router.get("/quizzes/{quiz_id}", response_model=QuizDetailResponse)
async def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_session),
) -> Optional[dict[str, Any]]:
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
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Create a new quiz."""
    service = QuizAdminService(db)
    try:
        return service.create_quiz(quiz_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/quizzes/batch",
    response_model=QuizDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_quiz_batch(
    quiz_data: QuizBatchCreate,
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Create a quiz with questions in a single batch operation."""
    service = QuizAdminService(db)
    try:
        return service.create_quiz_batch(quiz_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/quizzes/{quiz_id}", response_model=QuizDetailResponse)
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    db: Session = Depends(get_session),
) -> Optional[dict[str, Any]]:
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
    db: Session = Depends(get_session),
) -> None:
    """Delete a quiz."""
    service = QuizAdminService(db)
    try:
        success = service.delete_quiz(quiz_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Quiz nicht gefunden"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Image upload endpoints
@router.post("/quizzes/{quiz_id}/image", response_model=ImageUploadResponse)
async def upload_quiz_image(
    quiz_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
) -> ImageUploadResponse:
    """Upload an image for a quiz."""
    service = QuizAdminService(db)
    try:
        # Read file contents
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Bilddatei darf nicht größer als 5MB sein",
            )

        # Check if quiz exists
        quiz = service.get_quiz(quiz_id)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Quiz nicht gefunden"
            )

        # Upload image
        filename = file.filename or "unknown_file"
        service.upload_quiz_image(quiz_id, contents, filename)

        return ImageUploadResponse(
            message="Bild erfolgreich hochgeladen",
            filename=filename,
            quiz_id=quiz_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/quizzes/{quiz_id}/image")
async def get_quiz_image(
    quiz_id: int,
    db: Session = Depends(get_session),
) -> StreamingResponse:
    """Get the image for a quiz."""
    service = QuizAdminService(db)
    try:
        image_data, content_type = service.get_quiz_image(quiz_id)
        if not image_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Bild nicht gefunden"
            )

        return StreamingResponse(
            io.BytesIO(image_data), media_type=content_type or "image/jpeg"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/quizzes/{quiz_id}/image", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz_image(
    quiz_id: int,
    db: Session = Depends(get_session),
) -> None:
    """Delete the image for a quiz."""
    service = QuizAdminService(db)
    try:
        success = service.delete_quiz_image(quiz_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Bild nicht gefunden"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/quizzes/{quiz_id}/publish")
async def publish_quiz(
    quiz_id: int,
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Publish a quiz to make it available to users."""
    service = QuizAdminService(db)
    try:
        quiz = service.publish_quiz(quiz_id)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Quiz nicht gefunden"
            )
        return {"message": "Quiz erfolgreich veröffentlicht", "quiz_id": quiz_id}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/quizzes/{quiz_id}/archive")
async def archive_quiz(
    quiz_id: int,
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Archive a quiz to make it unavailable to users."""
    service = QuizAdminService(db)
    try:
        quiz = service.archive_quiz(quiz_id)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Quiz nicht gefunden"
            )
        return {"message": "Quiz erfolgreich archiviert", "quiz_id": quiz_id}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
