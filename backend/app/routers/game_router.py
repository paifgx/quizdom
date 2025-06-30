"""
Game router for actual gameplay.

Supports both curated quizzes and dynamic topic-based questions.
"""

from datetime import datetime
from typing import List, Optional, cast

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from starlette import status

from app.db.models import User, Quiz, Topic, Answer, SessionPlayers
from app.db.session import get_session
from app.routers.auth_router import get_current_user
from app.schemas.game import (
    GameSessionCreate,
    GameSessionResponse,
    QuestionResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    GameResultResponse,
    AnswerOption,
)
from app.services.game_service import GameService

router = APIRouter(prefix="/v1/game", tags=["game"])


@router.post("/quiz/{quiz_id}/start", response_model=GameSessionResponse)
async def start_quiz_game(
    quiz_id: int,
    game_data: GameSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> GameSessionResponse:
    """Start a game session with a curated quiz.

    Args:
        quiz_id: ID of the quiz to play
        game_data: Game session configuration
        current_user: Authenticated user
        db: Database session

    Returns:
        GameSessionResponse: Created game session details

    Raises:
        HTTPException: When quiz doesn't exist or has no questions
    """
    game_service = GameService(db)

    try:
        session = game_service.start_quiz_game(
            user=current_user,
            quiz_id=quiz_id,
            mode=game_data.mode
        )

        # Get quiz title
        quiz_title = None
        if session.quiz_id is not None:
            quiz = db.get(Quiz, session.quiz_id)
            if quiz:
                quiz_title = quiz.title

        # Ensure session.id is not None before using it in response
        session_id = session.id
        if session_id is None:
            raise ValueError("Session ID ist nicht verfügbar")

        return GameSessionResponse(
            session_id=session_id,
            mode=session.mode,
            quiz_id=quiz_id,
            quiz_title=quiz_title,
            total_questions=len(
                session.question_ids) if session.question_ids else 0,
            time_limit=quiz.time_limit_minutes if 'quiz' in locals() and quiz else None,
        )

    except ValueError as e:
        error_code = "quiz_game_error"
        field = None
        hint = None

        if "nicht verfügbar" in str(e):
            if "Session ID" in str(e):
                field = "session_id"
                hint = "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support"
            elif "User ID" in str(e):
                field = "user_id"
                hint = "Bitte melden Sie sich erneut an"
        elif "nicht veröffentlicht" in str(e):
            hint = "Dieses Quiz ist noch nicht für die Öffentlichkeit verfügbar"
        elif "keine Fragen" in str(e):
            hint = "Der Administrator muss dem Quiz Fragen hinzufügen"

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "detail": str(e),
                "code": error_code,
                "field": field,
                "hint": hint
            },
            headers={
                "X-Error-Code": error_code,
            },
        )


@router.post("/topic/{topic_id}/random", response_model=GameSessionResponse)
async def start_random_game(
    topic_id: int,
    game_data: GameSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> GameSessionResponse:
    """Start a game session with random questions from a topic.

    Args:
        topic_id: ID of the topic to select questions from
        game_data: Game session configuration
        current_user: Authenticated user
        db: Database session

    Returns:
        GameSessionResponse: Created game session details

    Raises:
        HTTPException: When topic doesn't exist or has no questions
    """
    game_service = GameService(db)

    try:
        session = game_service.start_topic_game(
            user=current_user,
            topic_id=topic_id,
            mode=game_data.mode,
            question_count=game_data.question_count or 10,
            difficulty_min=game_data.difficulty_min,
            difficulty_max=game_data.difficulty_max
        )

        # Get topic title
        topic_title = None
        if session.topic_id is not None:
            topic = db.get(Topic, session.topic_id)
            if topic:
                topic_title = topic.title

        # Ensure session.id is not None before using it in response
        session_id = session.id
        if session_id is None:
            raise ValueError("Session ID ist nicht verfügbar")

        return GameSessionResponse(
            session_id=session_id,
            mode=session.mode,
            topic_id=topic_id,
            topic_title=topic_title,
            total_questions=len(
                session.question_ids) if session.question_ids else 0,
            time_limit=None,
        )

    except ValueError as e:
        error_code = "topic_game_error"
        field = None
        hint = None

        if "nicht verfügbar" in str(e):
            if "Session ID" in str(e):
                field = "session_id"
                hint = "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support"
            elif "User ID" in str(e):
                field = "user_id"
                hint = "Bitte melden Sie sich erneut an"
        elif "nicht gefunden" in str(e):
            field = "topic_id"
            hint = "Bitte wählen Sie ein verfügbares Thema"
        elif "Keine Fragen" in str(e):
            hint = "Es gibt keine Fragen für diese Schwierigkeitsstufe, wählen Sie eine andere"

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "detail": str(e),
                "code": error_code,
                "field": field,
                "hint": hint
            },
            headers={
                "X-Error-Code": error_code,
            },
        )


@router.get("/session/{session_id}/question/{question_index}", response_model=QuestionResponse)
async def get_question(
    session_id: int,
    question_index: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> QuestionResponse:
    """Get a specific question from the game session.

    Args:
        session_id: ID of the game session
        question_index: Index of the question to retrieve
        current_user: Authenticated user
        db: Database session

    Returns:
        QuestionResponse: Question with answer options

    Raises:
        HTTPException: When session doesn't exist, user is not a participant,
                      or question index is invalid
    """
    game_service = GameService(db)

    try:
        question, answers, time_limit = game_service.get_question(
            session_id=session_id,
            question_index=question_index,
            user=current_user
        )

        # Ensure the question has an ID
        question_id = question.id
        if question_id is None:
            raise ValueError("Frage ID ist nicht verfügbar")

        return QuestionResponse(
            question_id=question_id,
            question_number=question_index + 1,
            content=question.content,
            answers=[
                AnswerOption(id=answer.id, content=answer.content)
                for answer in answers
                if answer.id is not None  # Filter out answers without IDs
            ],
            time_limit=time_limit,
            show_timestamp=int(datetime.utcnow().timestamp() * 1000),
        )

    except ValueError as e:
        # Extract error code from error message
        if "nicht gefunden" in str(e):
            if "Session" in str(e):
                error_code = "session_not_found"
                status_code = status.HTTP_404_NOT_FOUND
                field = "session_id"
                hint = "Die Spielsitzung existiert nicht oder wurde beendet"
            elif "Frage" in str(e):
                error_code = "question_not_found"
                status_code = status.HTTP_404_NOT_FOUND
                field = "question_index"
                hint = "Die angeforderte Frage existiert nicht"
            else:
                error_code = "not_found_error"
                status_code = status.HTTP_404_NOT_FOUND
                hint = "Die angeforderte Ressource wurde nicht gefunden"
        elif "Nicht Teil" in str(e):
            error_code = "not_session_participant"
            status_code = status.HTTP_403_FORBIDDEN
            hint = "Sie sind kein Teilnehmer dieser Spielsitzung"
        else:
            error_code = "question_error"
            status_code = status.HTTP_400_BAD_REQUEST
            hint = "Es ist ein Problem beim Abrufen der Frage aufgetreten"

        raise HTTPException(
            status_code=status_code,
            detail={
                "detail": str(e),
                "code": error_code,
                "field": field if 'field' in locals() else None,
                "hint": hint
            },
            headers={
                "X-Error-Code": error_code,
            },
        )


@router.post("/session/{session_id}/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    session_id: int,
    answer_data: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> SubmitAnswerResponse:
    """Submit an answer to a question in a game session.

    Args:
        session_id: ID of the game session
        answer_data: Answer submission data
        current_user: Authenticated user
        db: Database session

    Returns:
        SubmitAnswerResponse: Result of answer submission with feedback

    Raises:
        HTTPException: When session doesn't exist, user is not a participant,
                      or answer is invalid
    """
    game_service = GameService(db)

    try:
        is_correct, points_earned, response_time_ms, player_score, explanation = (
            game_service.submit_answer(
                session_id=session_id,
                question_id=answer_data.question_id,
                answer_id=answer_data.answer_id,
                user=current_user,
                answered_at=answer_data.answered_at
            )
        )

        # Get the correct answer
        from sqlmodel import select
        correct_answer = db.exec(
            select(Answer)
            .where(Answer.question_id == answer_data.question_id)
            .where(Answer.is_correct == True)
        ).first()

        if not correct_answer:
            raise ValueError("Keine korrekte Antwort gefunden")

        # Make sure correct_answer.id is not None
        correct_answer_id = correct_answer.id
        if correct_answer_id is None:
            raise ValueError("Antwort ID ist nicht verfügbar")

        # Get player hearts
        player = db.exec(
            select(SessionPlayers)
            .where(SessionPlayers.session_id == session_id)
            .where(SessionPlayers.user_id == current_user.id)
        ).first()

        if not player:
            raise ValueError("Spieler nicht gefunden")

        return SubmitAnswerResponse(
            is_correct=is_correct,
            correct_answer_id=correct_answer_id,
            points_earned=points_earned,
            response_time_ms=response_time_ms,
            player_score=player_score,
            player_hearts=player.hearts_left,
            explanation=explanation,
        )

    except ValueError as e:
        # Extract error code from error message
        if "nicht gefunden" in str(e):
            if "Session" in str(e):
                error_code = "session_not_found"
                status_code = status.HTTP_404_NOT_FOUND
                field = "session_id"
                hint = "Die Spielsitzung existiert nicht oder wurde beendet"
            else:
                error_code = "not_found_error"
                status_code = status.HTTP_404_NOT_FOUND
                hint = "Die angeforderte Ressource wurde nicht gefunden"
        elif "Nicht Teil" in str(e):
            error_code = "not_session_participant"
            status_code = status.HTTP_403_FORBIDDEN
            hint = "Sie sind kein Teilnehmer dieser Spielsitzung"
        elif "Ungültige" in str(e):
            if "Frage" in str(e):
                error_code = "invalid_question"
                status_code = status.HTTP_400_BAD_REQUEST
                field = "question_id"
                hint = "Die angegebene Frage gehört nicht zu dieser Spielsitzung"
            elif "Antwort" in str(e):
                error_code = "invalid_answer"
                status_code = status.HTTP_400_BAD_REQUEST
                field = "answer_id"
                hint = "Die angegebene Antwort gehört nicht zu dieser Frage"
            else:
                error_code = "invalid_parameter"
                status_code = status.HTTP_400_BAD_REQUEST
                hint = "Ein angegebener Parameter ist ungültig"
        else:
            error_code = "answer_error"
            status_code = status.HTTP_400_BAD_REQUEST
            hint = "Es ist ein Problem bei der Antwortübermittlung aufgetreten"

        raise HTTPException(
            status_code=status_code,
            detail={
                "detail": str(e),
                "code": error_code,
                "field": field if 'field' in locals() else None,
                "hint": hint
            },
            headers={
                "X-Error-Code": error_code,
            },
        )


@router.post("/session/{session_id}/complete", response_model=GameResultResponse)
async def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> GameResultResponse:
    """Complete a game session and get results.

    Args:
        session_id: ID of the game session to complete
        current_user: Authenticated user
        db: Database session

    Returns:
        GameResultResponse: Game session results

    Raises:
        HTTPException: When session doesn't exist or user is not a participant
    """
    game_service = GameService(db)

    try:
        result = game_service.complete_session(
            session_id=session_id,
            user=current_user
        )

        # Convert dict to response model
        return GameResultResponse(
            session_id=result["session_id"],
            mode=result["mode"],
            result=result["result"],
            final_score=result["final_score"],
            hearts_remaining=result["hearts_remaining"],
            questions_answered=result["questions_answered"],
            correct_answers=result["correct_answers"],
            total_time_seconds=result["total_time_seconds"],
            rank=result["rank"],
            percentile=result["percentile"],
        )

    except ValueError as e:
        # Extract error code from error message
        field = None
        if "nicht gefunden" in str(e):
            if "Session" in str(e):
                error_code = "session_not_found"
                status_code = status.HTTP_404_NOT_FOUND
                field = "session_id"
                hint = "Die Spielsitzung existiert nicht oder wurde beendet"
            else:
                error_code = "not_found_error"
                status_code = status.HTTP_404_NOT_FOUND
                hint = "Die angeforderte Ressource wurde nicht gefunden"
        elif "Nicht Teil" in str(e):
            error_code = "not_session_participant"
            status_code = status.HTTP_403_FORBIDDEN
            hint = "Sie sind kein Teilnehmer dieser Spielsitzung"
        else:
            error_code = "complete_error"
            status_code = status.HTTP_400_BAD_REQUEST
            hint = "Es ist ein Problem beim Abschließen der Spielsitzung aufgetreten"

        raise HTTPException(
            status_code=status_code,
            detail={
                "detail": str(e),
                "code": error_code,
                "field": field,
                "hint": hint
            },
            headers={
                "X-Error-Code": error_code,
            },
        )
