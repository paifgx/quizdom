"""Admin router for quiz management."""

import io
import logging
from datetime import datetime, timedelta
from typing import Any, List, Optional, cast

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import func, or_
from sqlmodel import Session, col, select
from starlette.responses import StreamingResponse

from app.core.logging import app_logger, log_operation
from app.core.security import get_password_hash
from app.db.models import Role, SessionPlayers, Topic, User, UserRoles
from app.db.session import get_session
from app.routers.auth_router import get_current_user
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
from app.schemas.user import (
    UserCreateRequest,
    UserListItemResponse,
    UserListResponse,
    UserStatsResponse,
    UserStatusUpdateRequest,
    UserUpdateRequest,
)
from app.services.quiz_admin_service import QuizAdminService

router = APIRouter(prefix="/v1/admin", tags=["admin"])

logger = logging.getLogger(__name__)


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


# User Management Endpoints
@router.get("/users", response_model=UserListResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    role_filter: Optional[str] = None,
    status_filter: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> UserListResponse:
    """List all users with pagination and filtering.

    Args:
        skip: Number of users to skip
        limit: Maximum number of users to return
        search: Optional search term for email
        role_filter: Optional role filter (admin, user, etc)
        status_filter: Optional status filter (active, inactive)
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        UserListResponse: List of users with pagination metadata
    """
    query = select(User)

    # Apply filters if provided
    if search:
        query = query.where(col(User.email).contains(search))

    if status_filter:
        if status_filter.lower() == "active":
            query = query.where(User.deleted_at == None)  # noqa: E711
        elif status_filter.lower() == "inactive":
            query = query.where(User.deleted_at != None)  # noqa: E711

    # Get total count before applying pagination
    total_query = select(func.count()).select_from(query.subquery())
    total = session.exec(total_query).one()

    # Apply pagination
    query = query.offset(skip).limit(limit)

    # Execute query
    users_db = session.exec(query).all()

    # Process users and add role information
    result_users = []
    for user in users_db:
        # Get role information
        role_query = (
            select(Role.name)
            .join(UserRoles)
            .where(UserRoles.role_id == Role.id)
            .where(UserRoles.user_id == user.id)
        )
        role_name = session.exec(role_query).first()

        # Only apply role filter after getting the role name
        if role_filter and role_name != role_filter:
            continue

        # Get user statistics (quizzes completed, scores)
        user_id = cast(int, user.id)  # Cast to avoid type error

        quizzes_completed_query = (
            select(func.count())
            .select_from(SessionPlayers)
            .where(SessionPlayers.user_id == user_id)
        )
        quizzes_completed = session.exec(quizzes_completed_query).one() or 0

        # Get average score and total score
        avg_score_query = (
            select(func.avg(SessionPlayers.score))
            .select_from(SessionPlayers)
            .where(SessionPlayers.user_id == user_id)
        )
        average_score = session.exec(avg_score_query).one() or 0.0

        total_score_query = (
            select(func.sum(SessionPlayers.score))
            .select_from(SessionPlayers)
            .where(SessionPlayers.user_id == user_id)
        )
        total_score = session.exec(total_score_query).one() or 0

        # Create response object
        result_users.append(
            UserListItemResponse(
                id=user_id,
                email=user.email,
                is_verified=user.is_verified,
                created_at=user.created_at,
                deleted_at=user.deleted_at,
                role_name=role_name,
                last_login=None,  # Add this field if available in your model
                quizzes_completed=quizzes_completed,
                average_score=average_score,
                total_score=total_score,
            )
        )

    return UserListResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=result_users,
    )


@router.get("/users/stats", response_model=UserStatsResponse)
async def get_user_stats(
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> UserStatsResponse:
    """Get user statistics.

    Args:
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        UserStatsResponse: User statistics
    """
    # Get total users
    total_users = session.exec(select(func.count()).select_from(User)).one()

    # Get verified users count
    verified_users = session.exec(
        select(func.count()).where(User.is_verified)).one()

    # Get recent registrations (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_registrations = session.exec(
        select(func.count()).where(User.created_at >= thirty_days_ago)
    ).one()

    # Get active users (users who have played games)
    active_users = session.exec(
        select(func.count(func.distinct(SessionPlayers.user_id))).select_from(
            SessionPlayers
        )
    ).one()

    # Get admin users count
    admin_users_query = (
        select(func.count(func.distinct(UserRoles.user_id)))
        .select_from(UserRoles)
        .join(Role)
        .where(UserRoles.role_id == Role.id)
        .where(Role.name == "admin")
    )
    admin_users = session.exec(admin_users_query).one()

    return UserStatsResponse(
        total_users=total_users,
        verified_users=verified_users,
        recent_registrations=recent_registrations,
        active_users=active_users,
        admin_users=admin_users,
        new_users_this_month=recent_registrations,
    )


@router.get("/users/{user_id}", response_model=UserListItemResponse)
async def get_user(
    user_id: int,
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> UserListItemResponse:
    """Get a specific user by ID.

    Args:
        user_id: User ID to retrieve
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        UserListItemResponse: User details
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden"
        )

    # Cast to avoid type errors
    user_id_cast = cast(int, user.id)

    # Get role information
    role_query = (
        select(Role.name)
        .join(UserRoles)
        .where(UserRoles.role_id == Role.id)
        .where(UserRoles.user_id == user_id_cast)
    )
    role_name = session.exec(role_query).first()

    # Get user statistics
    quizzes_completed_query = (
        select(func.count())
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    quizzes_completed = session.exec(quizzes_completed_query).one() or 0

    avg_score_query = (
        select(func.avg(SessionPlayers.score))
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    average_score = session.exec(avg_score_query).one() or 0.0

    total_score_query = (
        select(func.sum(SessionPlayers.score))
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    total_score = session.exec(total_score_query).one() or 0

    return UserListItemResponse(
        id=user_id_cast,
        email=user.email,
        is_verified=user.is_verified,
        created_at=user.created_at,
        deleted_at=user.deleted_at,
        role_name=role_name,
        last_login=None,  # Add this field if available in your model
        quizzes_completed=quizzes_completed,
        average_score=average_score,
        total_score=total_score,
    )


@router.post(
    "/users", status_code=status.HTTP_201_CREATED, response_model=UserListItemResponse
)
async def create_user(
    user_data: UserCreateRequest,
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> UserListItemResponse:
    """Create a new user.

    Args:
        user_data: User data to create
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        UserListItemResponse: Created user details
    """
    # Check if email already exists
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-Mail-Adresse wird bereits verwendet",
        )

    # Hash password
    password_hash = get_password_hash(user_data.password)

    # Create user
    new_user = User(
        email=user_data.email,
        password_hash=password_hash,
        is_verified=user_data.is_verified,
        created_at=datetime.now(),
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # We need user id for role assignment, ensure it's not None
    new_user_id = cast(int, new_user.id)

    # Assign role if provided
    if user_data.role_id:
        role = session.get(Role, user_data.role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültige Rolle"
            )

        user_role = UserRoles(
            user_id=new_user_id, role_id=user_data.role_id, granted_at=datetime.now()
        )
        session.add(user_role)
        session.commit()

    # Get role name for response
    role_name = None
    if user_data.role_id:
        role = session.get(Role, user_data.role_id)
        if role:
            role_name = role.name

    return UserListItemResponse(
        id=new_user_id,
        email=new_user.email,
        is_verified=new_user.is_verified,
        created_at=new_user.created_at,
        deleted_at=new_user.deleted_at,
        role_name=role_name,
        last_login=None,
        quizzes_completed=0,
        average_score=0.0,
        total_score=0,
    )


@router.put("/users/{user_id}", response_model=UserListItemResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> UserListItemResponse:
    """Update a user.

    Args:
        user_id: User ID to update
        user_data: User data to update
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        UserListItemResponse: Updated user details
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden"
        )

    # Cast to avoid type errors
    user_id_cast = cast(int, user.id)

    # Update email if provided and different
    if user_data.email and user_data.email != user.email:
        # Check if email is already used
        existing_user = session.exec(
            select(User).where(User.email == user_data.email).where(
                User.id != user_id)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="E-Mail-Adresse wird bereits verwendet",
            )
        user.email = user_data.email

    # Update verification status if provided
    if user_data.is_verified is not None:
        user.is_verified = user_data.is_verified

    # Update role if provided
    current_role_id = None
    if user_data.role_id is not None:
        # First, check if the role exists
        role = session.get(Role, user_data.role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Ungültige Rolle"
            )

        # Get current role assignment if any
        current_role = session.exec(
            select(UserRoles).where(UserRoles.user_id == user_id_cast)
        ).first()

        if current_role:
            # Update existing role
            if current_role.role_id != user_data.role_id:
                current_role.role_id = user_data.role_id
                session.add(current_role)
                current_role_id = user_data.role_id
        else:
            # Create new role assignment
            user_role = UserRoles(
                user_id=user_id_cast,
                role_id=user_data.role_id,
                granted_at=datetime.now(),
            )
            session.add(user_role)
            current_role_id = user_data.role_id

    # Commit changes
    session.add(user)
    session.commit()
    session.refresh(user)

    # Get role name for response
    role_query = (
        select(Role.name)
        .join(UserRoles)
        .where(UserRoles.role_id == Role.id)
        .where(UserRoles.user_id == user_id_cast)
    )
    role_name = session.exec(role_query).first()

    # Get user statistics
    quizzes_completed_query = (
        select(func.count())
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    quizzes_completed = session.exec(quizzes_completed_query).one() or 0

    avg_score_query = (
        select(func.avg(SessionPlayers.score))
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    average_score = session.exec(avg_score_query).one() or 0.0

    total_score_query = (
        select(func.sum(SessionPlayers.score))
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    total_score = session.exec(total_score_query).one() or 0

    return UserListItemResponse(
        id=user_id_cast,
        email=user.email,
        is_verified=user.is_verified,
        created_at=user.created_at,
        deleted_at=user.deleted_at,
        role_name=role_name,
        last_login=None,
        quizzes_completed=quizzes_completed,
        average_score=average_score,
        total_score=total_score,
    )


@router.put("/users/{user_id}/status", response_model=UserListItemResponse)
async def update_user_status(
    user_id: int,
    status_data: UserStatusUpdateRequest,
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> UserListItemResponse:
    """Update user status (activate/deactivate).

    Args:
        user_id: User ID to update
        status_data: Status data to update
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        UserListItemResponse: Updated user details
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden"
        )

    # Cast to avoid type errors
    user_id_cast = cast(int, user.id)

    # Update deleted_at field
    user.deleted_at = status_data.deleted_at

    # Commit changes
    session.add(user)
    session.commit()
    session.refresh(user)

    # Get role name for response
    role_query = (
        select(Role.name)
        .join(UserRoles)
        .where(UserRoles.role_id == Role.id)
        .where(UserRoles.user_id == user_id_cast)
    )
    role_name = session.exec(role_query).first()

    # Get user statistics
    quizzes_completed_query = (
        select(func.count())
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    quizzes_completed = session.exec(quizzes_completed_query).one() or 0

    avg_score_query = (
        select(func.avg(SessionPlayers.score))
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    average_score = session.exec(avg_score_query).one() or 0.0

    total_score_query = (
        select(func.sum(SessionPlayers.score))
        .select_from(SessionPlayers)
        .where(SessionPlayers.user_id == user_id_cast)
    )
    total_score = session.exec(total_score_query).one() or 0

    return UserListItemResponse(
        id=user_id_cast,
        email=user.email,
        is_verified=user.is_verified,
        created_at=user.created_at,
        deleted_at=user.deleted_at,
        role_name=role_name,
        last_login=None,
        quizzes_completed=quizzes_completed,
        average_score=average_score,
        total_score=total_score,
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> None:
    """Permanently delete a user.

    Args:
        user_id: User ID to delete
        admin_user: Admin user dependency
        session: Database session dependency
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden"
        )

    # Delete user roles first
    user_roles = session.exec(
        select(UserRoles).where(UserRoles.user_id == user_id)
    ).all()

    for role in user_roles:
        session.delete(role)

    # Delete the user
    session.delete(user)
    session.commit()


@router.get("/roles", response_model=List[Role])
async def get_roles(
    admin_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
) -> List[Role]:
    """Get all available roles.

    Args:
        admin_user: Admin user dependency
        session: Database session dependency

    Returns:
        List[Role]: List of all roles
    """
    roles = session.exec(select(Role)).all()
    return list(roles)  # Convert to List to match return type
