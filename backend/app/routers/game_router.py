"""
Game router for actual gameplay.

Supports both curated quizzes and dynamic topic-based questions.
This router provides endpoints for:
- Starting game sessions with curated quizzes or random topic questions
- Retrieving questions during gameplay
- Submitting and validating answers
- Completing game sessions and retrieving results
"""

from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from app.core.config import settings
from app.db.models import GameSession, GameStatus, Quiz, SessionPlayers, Topic, User
from app.db.session import get_session
from app.routers.auth_router import get_current_user
from app.schemas.game import (
    AnswerOption,
    GameResultResponse,
    GameSessionCreate,
    GameSessionResponse,
    QuestionResponse,
    SessionJoinResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
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

    Creates a new game session for the specified quiz and authenticated user.
    The game session includes all questions from the quiz in the order defined
    in the quiz configuration.

    This endpoint:
    - Validates that the quiz exists and is published
    - Creates a game session with the specified mode
    - Adds the current user as a player with initial state (3 hearts, 0 score)
    - Returns session details including question count and time limits

    Args:
        quiz_id: ID of the quiz to play
        game_data: Game session configuration including mode and options
        current_user: Authenticated user retrieved from auth token
        db: Database session for data operations

    Returns:
        GameSessionResponse: Created game session details including session ID,
                            mode, quiz info, and question count

    Raises:
        HTTPException:
            - 400 Bad Request: When quiz doesn't exist, isn't published, or has no questions
            - 400 Bad Request: When session creation fails for any other reason
    """
    game_service = GameService(db)

    try:
        session = game_service.start_quiz_game(
            user=current_user, quiz_id=quiz_id, mode=game_data.mode
        )

        # Get quiz title
        quiz_title: Optional[str] = None
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
            total_questions=len(session.question_ids) if session.question_ids else 0,
            time_limit=quiz.time_limit_minutes if "quiz" in locals() and quiz else None,
        )

    except ValueError as e:
        error_code: str = "quiz_game_error"
        field: Optional[str] = None
        hint: Optional[str] = None

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
            detail={"detail": str(e), "code": error_code, "field": field, "hint": hint},
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

    Creates a new game session with randomly selected questions from the specified topic.
    Questions are filtered by difficulty if min/max parameters are provided in game_data.

    This endpoint:
    - Validates that the topic exists and has questions matching the criteria
    - Selects random questions based on provided count and difficulty range
    - Creates a game session with the specified mode
    - Adds the current user as a player with initial state (3 hearts, 0 score)
    - Returns session details including question count

    Args:
        topic_id: ID of the topic to select questions from
        game_data: Game session configuration including mode, question count, and difficulty range
        current_user: Authenticated user retrieved from auth token
        db: Database session for data operations

    Returns:
        GameSessionResponse: Created game session details including session ID,
                            mode, topic info, and question count

    Raises:
        HTTPException:
            - 400 Bad Request: When topic doesn't exist or has no matching questions
            - 400 Bad Request: When session creation fails for any other reason
    """
    game_service = GameService(db)

    try:
        session = game_service.start_topic_game(
            user=current_user,
            topic_id=topic_id,
            mode=game_data.mode,
            question_count=game_data.question_count or 10,
            difficulty_min=game_data.difficulty_min,
            difficulty_max=game_data.difficulty_max,
        )

        # Get topic title
        topic_title: Optional[str] = None
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
            total_questions=len(session.question_ids) if session.question_ids else 0,
            time_limit=None,
        )

    except ValueError as e:
        error_code: str = "topic_game_error"
        field: Optional[str] = None
        hint: Optional[str] = None

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
            detail={"detail": str(e), "code": error_code, "field": field, "hint": hint},
            headers={
                "X-Error-Code": error_code,
            },
        )


@router.post("/session/{session_id}/join", response_model=SessionJoinResponse)
async def join_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> SessionJoinResponse:
    """Join an existing game session.

    Allows a user to join an existing multiplayer game session via invite link.
    This endpoint:
    - Validates that the session exists and is active
    - Checks if the user is already a participant (returns current state if so)
    - Adds the user as a new player if the session has room
    - Returns session details including all players and progress

    For multiplayer games:
    - Competitive mode: 2 players compete against each other
    - Collaborative mode: 2 players work together
    - Solo mode: Only 1 player allowed (joining not permitted)

    The first player to create the session is marked as the host.

    Args:
        session_id: ID of the game session to join
        current_user: Authenticated user retrieved from auth token
        db: Database session for data operations

    Returns:
        SessionJoinResponse: Session details including players and current state

    Raises:
        HTTPException:
            - 404 Not Found: When session doesn't exist
            - 400 Bad Request: When session is not active, full, or other errors
    """
    game_service = GameService(db)

    try:
        session, players = game_service.join_session(
            session_id=session_id, user=current_user
        )

        # Get all users for the players
        player_details = []
        for idx, player in enumerate(players):
            player_user = db.get(User, player.user_id)
            if player_user:
                player_details.append(
                    {
                        "id": str(player_user.id),
                        "name": player_user.nickname or player_user.email.split("@")[0],
                        "score": player.score,
                        "hearts": player.hearts_left,
                        "is_host": idx == 0,  # First player is the host
                    }
                )

        return SessionJoinResponse(
            session_id=str(session_id),
            mode=session.mode.value,
            players=player_details,
            current_question=session.current_question_index,
            total_questions=len(session.question_ids) if session.question_ids else 0,
            quiz_id=session.quiz_id,
            topic_id=session.topic_id,
        )

    except ValueError as e:
        error_code: str
        status_code: int
        field: Optional[str] = None
        hint: Optional[str]

        error_msg = str(e)
        if "nicht gefunden" in error_msg:
            error_code = "session_not_found"
            status_code = status.HTTP_404_NOT_FOUND
            field = "session_id"
            hint = "Die Spielsitzung existiert nicht oder wurde beendet"
        elif "nicht mehr aktiv" in error_msg:
            error_code = "session_not_active"
            status_code = status.HTTP_400_BAD_REQUEST
            hint = "Die Spielsitzung ist nicht mehr aktiv"
        elif "bereits voll" in error_msg:
            error_code = "session_full"
            status_code = status.HTTP_400_BAD_REQUEST
            hint = "Die Spielsitzung ist bereits voll"
        elif "nur einen Spieler" in error_msg:
            error_code = "solo_session"
            status_code = status.HTTP_400_BAD_REQUEST
            hint = "Solo-Spiele erlauben keine weiteren Spieler"
        else:
            error_code = "join_error"
            status_code = status.HTTP_400_BAD_REQUEST
            hint = "Es ist ein Problem beim Beitreten aufgetreten"

        raise HTTPException(
            status_code=status_code,
            detail={"detail": str(e), "code": error_code, "field": field, "hint": hint},
            headers={
                "X-Error-Code": error_code,
            },
        )


@router.get(
    "/session/{session_id}/question/{question_index}", response_model=QuestionResponse
)
async def get_question(
    session_id: int,
    question_index: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> QuestionResponse:
    """Get a specific question from the game session.

    Retrieves the question at the specified index from an active game session.
    This endpoint enforces security by verifying that:
    - The session exists
    - The user is a participant in the session
    - The question index is valid for the session

    The session's current_question_index is updated to track progress,
    and a timestamp is generated to calculate response time when the answer
    is submitted.

    Time limits are applied based on:
    - For quiz-based games: time is divided evenly among questions
    - For topic-based games: default 30-second limit per question

    Args:
        session_id: ID of the game session to retrieve a question from
        question_index: Zero-based index of the question to retrieve
        current_user: Authenticated user retrieved from auth token
        db: Database session for data operations

    Returns:
        QuestionResponse: Question content, answer options, question number,
                         time limit, and timestamp when shown

    Raises:
        HTTPException:
            - 404 Not Found: When session or question doesn't exist
            - 403 Forbidden: When user is not a participant in the session
            - 400 Bad Request: For invalid question indices or other errors
    """
    game_service = GameService(db)

    try:
        question, answers, time_limit = game_service.get_question(
            session_id=session_id, question_index=question_index, user=current_user
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
        error_code: str
        status_code: int
        field: Optional[str] = None
        hint: Optional[str]

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
            detail={"detail": str(e), "code": error_code, "field": field, "hint": hint},
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

    Processes a player's answer to a question, handling:
    - Validation of session, user participation, question, and answer
    - Correctness checking against the correct answer
    - Response time calculation based on the provided timestamp
    - Point calculation based on correctness and response time
    - Player score updating
    - Hearts/lives management for incorrect answers (except in collaborative mode)

    The scoring system rewards faster correct answers:
    - 0-3 seconds: 100 points
    - 3-6 seconds: 50 points
    - >6 seconds: 25 points

    Incorrect answers result in:
    - No points gained
    - Loss of one heart/life (except in collaborative mode)

    Args:
        session_id: ID of the game session the answer belongs to
        answer_data: Answer submission data containing question ID, answer ID, and timestamp
        current_user: Authenticated user retrieved from auth token
        db: Database session for data operations

    Returns:
        SubmitAnswerResponse: Result including correctness, points earned, player score,
                             remaining hearts, and explanation if available

    Raises:
        HTTPException:
            - 404 Not Found: When session doesn't exist
            - 403 Forbidden: When user is not a participant in the session
            - 400 Bad Request: For invalid questions, answers, or other errors
    """
    game_service = GameService(db)

    try:
        # Call the enhanced service method that now returns more data
        (
            is_correct,
            points_earned,
            response_time_ms,
            player_score,
            explanation,
            player_hearts,
            correct_answer_id,
        ) = game_service.submit_answer(
            session_id=session_id,
            question_id=answer_data.question_id,
            answer_id=answer_data.answer_id,
            user=current_user,
            answered_at=answer_data.answered_at,
        )

        return SubmitAnswerResponse(
            is_correct=is_correct,
            correct_answer_id=correct_answer_id,
            points_earned=points_earned,
            response_time_ms=response_time_ms,
            player_score=player_score,
            player_hearts=player_hearts,
            explanation=explanation,
        )

    except ValueError as e:
        # Extract error code from error message
        error_code: str
        status_code: int
        field: Optional[str] = None
        hint: Optional[str]

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
            detail={"detail": str(e), "code": error_code, "field": field, "hint": hint},
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

    Finalizes a game session, calculating statistics and setting the status to FINISHED.
    This endpoint:
    - Verifies session exists and user is a participant
    - Marks the session as finished with an end timestamp
    - Calculates final statistics:
      - Questions answered and correct answer count
      - Total time spent
      - Final score and hearts remaining
      - Result (win/fail) based on hearts

    A game is considered won if the player still has at least one heart remaining
    at the end of the session. Otherwise, it's considered a failure.

    Note: The rank and percentile features are placeholders for future leaderboard
    functionality and currently return default values.

    Args:
        session_id: ID of the game session to complete
        current_user: Authenticated user retrieved from auth token
        db: Database session for data operations

    Returns:
        GameResultResponse: Complete game results including score, statistics,
                           and outcome (win/fail)

    Raises:
        HTTPException:
            - 404 Not Found: When session doesn't exist
            - 403 Forbidden: When user is not a participant in the session
            - 400 Bad Request: For any other errors during completion
    """
    game_service = GameService(db)

    try:
        result: Dict[str, Any] = game_service.complete_session(
            session_id=session_id, user=current_user
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
        error_code: str
        status_code: int
        field: Optional[str] = None
        hint: Optional[str]

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
            detail={"detail": str(e), "code": error_code, "field": field, "hint": hint},
            headers={
                "X-Error-Code": error_code,
            },
        )


@router.get("/session/{session_id}/status")
async def get_session_status(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> Dict[str, Any]:
    """Get status of a game session.

    Returns current session state including players and game progress.
    Useful for polling to check if all players have joined.

    Args:
        session_id: ID of the game session to check
        current_user: Authenticated user retrieved from auth token
        db: Database session for data operations

    Returns:
        Dict with session status, players, and current state

    Raises:
        HTTPException:
            - 404 Not Found: When session doesn't exist
            - 403 Forbidden: When user is not a participant
    """
    # Get session
    session = db.get(GameSession, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "detail": "Spielsitzung nicht gefunden",
                "code": "session_not_found",
            },
        )

    # Get all players
    players_stmt = select(SessionPlayers).where(SessionPlayers.session_id == session_id)
    players = list(db.exec(players_stmt).all())

    # Check if current user is a participant
    is_participant = any(p.user_id == current_user.id for p in players)
    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "detail": "Nicht Teil dieser Spielsitzung",
                "code": "not_session_participant",
            },
        )

    # Get player details
    player_details = []
    for idx, player in enumerate(players):
        player_user = db.get(User, player.user_id)
        if player_user:
            player_details.append(
                {
                    "id": str(player_user.id),
                    "name": player_user.nickname or player_user.email.split("@")[0],
                    "score": player.score,
                    "hearts": player.hearts_left,
                    "is_host": idx == 0,
                }
            )

    return {
        "session_id": session_id,
        "status": session.status.value,
        "mode": session.mode.value,
        "players": player_details,
        "current_question": session.current_question_index,
        "total_questions": len(session.question_ids) if session.question_ids else 0,
        "player_count": len(players),
    }


@router.put("/session/{session_id}/ready")
async def set_ready_status(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> Dict[str, Any]:
    """Toggle ready status for a player in the lobby.

    This endpoint:
    - Toggles the ready status of the current player
    - Sends a WebSocket event to all players with the updated ready list
    - If both players are ready, starts a 5-second countdown
    - After countdown, starts the actual game

    Args:
        session_id: ID of the game session
        current_user: Authenticated user
        db: Database session

    Returns:
        Dict with updated ready status and player list

    Raises:
        HTTPException:
            - 404: Session not found
            - 403: User not in session
            - 409: Session not in WAITING status
            - 501: Feature not enabled
    """
    import asyncio

    from app.routers.ws_router import manager

    # Check if lobby feature is enabled
    if not settings.enable_lobby:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Lobby-Feature ist nicht aktiviert",
        )

    # Get session
    session = db.get(GameSession, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spielsitzung nicht gefunden",
        )

    # Check if session is in WAITING status
    if session.status != GameStatus.WAITING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Sitzung ist nicht im Wartemodus",
        )

    # Get current player
    player_stmt = (
        select(SessionPlayers)
        .where(SessionPlayers.session_id == session_id)
        .where(SessionPlayers.user_id == current_user.id)
    )
    player = db.exec(player_stmt).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nicht Teil dieser Spielsitzung",
        )

    # Toggle ready status
    player.ready = not player.ready
    db.add(player)
    db.commit()

    # Get all players
    all_players_stmt = select(SessionPlayers).where(
        SessionPlayers.session_id == session_id
    )
    all_players = list(db.exec(all_players_stmt).all())

    # Get player details with ready status
    player_details = []
    for idx, p in enumerate(all_players):
        user = db.get(User, p.user_id)
        if user:
            player_details.append(
                {
                    "id": str(user.id),
                    "name": user.nickname or user.email.split("@")[0],
                    "ready": p.ready,
                    "is_host": idx == 0,
                }
            )

    # Send WebSocket event to all players
    await manager.broadcast(
        {"event": "player-ready", "payload": {"players": player_details}},
        session_id,
    )

    # Check if both players are ready and we have exactly 2 players
    if len(all_players) == 2 and all(p.ready for p in all_players):
        # Start countdown
        session.status = GameStatus.COUNTDOWN
        session.countdown_started_at = datetime.utcnow()
        db.add(session)
        db.commit()

        # Send countdown event
        await manager.broadcast(
            {
                "event": "session-countdown",
                "payload": {
                    "seconds": 5,
                    "start_at": session.countdown_started_at.isoformat(),
                },
            },
            session_id,
        )

        # Start async task for countdown
        async def countdown_task():
            await asyncio.sleep(5)

            # Re-fetch session to check if it's still in countdown
            db_countdown = Session(bind=db.get_bind())
            try:
                session_check = db_countdown.get(GameSession, session_id)

                if session_check and session_check.status == GameStatus.COUNTDOWN:
                    # Start the game
                    session_check.status = GameStatus.ACTIVE
                    session_check.started_at = datetime.utcnow()
                    db_countdown.add(session_check)
                    db_countdown.commit()

                    # Send session-start event
                    await manager.broadcast(
                        {
                            "event": "session-start",
                            "payload": {
                                "started_at": session_check.started_at.isoformat()
                            },
                        },
                        session_id,
                    )

                    # Re-fetch players inside the new session to avoid using detached instances
                    all_players_stmt = select(SessionPlayers).where(
                        SessionPlayers.session_id == session_id
                    )
                    all_players_in_task = list(
                        db_countdown.exec(all_players_stmt).all()
                    )

                    # Send first question
                    if all_players_in_task:
                        game_service = GameService(db_countdown)
                        try:
                            # Get any user from the session to fetch question data
                            first_player = all_players_in_task[0]
                            user_for_question = db_countdown.get(
                                User, first_player.user_id
                            )

                            if user_for_question and session_check.question_ids:
                                question_data = game_service.get_question_data(
                                    session_id=session_id,
                                    question_index=0,
                                    user=user_for_question,
                                )

                                await manager.broadcast(
                                    {
                                        "event": "question",
                                        "payload": question_data,
                                        "index": 0,
                                    },
                                    session_id,
                                )
                        except Exception as e:
                            print(f"Error sending first question: {e}")
            finally:
                db_countdown.close()

        # Run countdown task in background
        asyncio.create_task(countdown_task())

    return {
        "ready": player.ready,
        "players": player_details,
    }


@router.post("/session/{session_id}/pause")
async def pause_countdown(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> Dict[str, Any]:
    """Pause the countdown (host only).

    This endpoint:
    - Can only be called by the session host
    - Only works during COUNTDOWN status
    - Resets status to WAITING
    - Resets all players' ready status
    - Cancels the countdown task

    Args:
        session_id: ID of the game session
        current_user: Authenticated user (must be host)
        db: Database session

    Returns:
        Dict with success status

    Raises:
        HTTPException:
            - 404: Session not found
            - 403: User not host
            - 409: Session not in COUNTDOWN status
            - 501: Feature not enabled
    """
    from app.routers.ws_router import manager

    # Check if lobby feature is enabled
    if not settings.enable_lobby:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Lobby-Feature ist nicht aktiviert",
        )

    # Get session
    session = db.get(GameSession, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spielsitzung nicht gefunden",
        )

    # Check if session is in COUNTDOWN status
    if session.status != GameStatus.COUNTDOWN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Sitzung ist nicht im Countdown-Modus",
        )

    # Check if user is the host (first player)
    players_stmt = select(SessionPlayers).where(SessionPlayers.session_id == session_id)
    players = list(db.exec(players_stmt).all())

    if not players or players[0].user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur der Host kann den Countdown stoppen",
        )

    # Reset session status
    session.status = GameStatus.WAITING
    session.countdown_started_at = None
    db.add(session)

    # Reset all players' ready status
    for player in players:
        player.ready = False
        db.add(player)

    db.commit()

    # Send paused event
    await manager.broadcast(
        {"event": "session-paused", "payload": {"status": "waiting"}},
        session_id,
    )

    return {"success": True, "status": "waiting"}
