"""
Game router for actual gameplay.
Supports both curated quizzes and dynamic topic-based questions.
"""

from datetime import datetime
from typing import List, Optional
from random import sample

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from sqlalchemy import and_

from app.db.models import (
    Answer,
    GameMode,
    GameSession,
    GameStatus,
    PlayerAnswer,
    Question,
    Quiz,
    QuizQuestion,
    QuizStatus,
    SessionPlayers,
    Topic,
    User,
)
from app.db.session import get_session
from app.routers.auth import get_current_user
from app.schemas.game import (
    GameSessionCreate,
    GameSessionResponse,
    QuestionResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    GameResultResponse,
    AnswerOption,
)

router = APIRouter(prefix="/v1/game", tags=["game"])


@router.post("/quiz/{quiz_id}/start", response_model=GameSessionResponse)
async def start_quiz_game(
    quiz_id: int,
    game_data: GameSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Start a game session with a curated quiz."""
    # Verify quiz exists and is published
    quiz = db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz nicht gefunden")

    if quiz.status != QuizStatus.PUBLISHED:
        raise HTTPException(
            status_code=400,
            detail="Quiz ist nicht veröffentlicht"
        )

    # Get questions for this quiz in order
    stmt = (
        select(Question)
        .join(QuizQuestion)
        .where(QuizQuestion.quiz_id == quiz_id)
        .order_by(QuizQuestion.order)
    )
    questions = list(db.exec(stmt).all())

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="Quiz enthält keine Fragen"
        )

    # Create game session
    session = GameSession(
        mode=game_data.mode,
        status=GameStatus.ACTIVE,
        quiz_id=quiz_id,
        question_ids=[q.id for q in questions]
    )
    db.add(session)
    db.flush()

    # Add player to session
    session_player = SessionPlayers(
        session_id=session.id,
        user_id=current_user.id,
        hearts_left=3,
        score=0,
    )
    db.add(session_player)

    # Increment quiz play count
    quiz.play_count += 1

    db.commit()
    db.refresh(session)

    return GameSessionResponse(
        session_id=session.id,
        mode=session.mode,
        quiz_id=quiz_id,
        quiz_title=quiz.title,
        total_questions=len(questions),
        time_limit=quiz.time_limit_minutes,
    )


@router.post("/topic/{topic_id}/random", response_model=GameSessionResponse)
async def start_random_game(
    topic_id: int,
    game_data: GameSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Start a game session with random questions from a topic."""
    # Verify topic exists
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Thema nicht gefunden")

    # Get random questions from topic
    stmt = select(Question).where(Question.topic_id == topic_id)

    # Apply difficulty filter if specified
    if game_data.difficulty_min and game_data.difficulty_max:
        stmt = stmt.where(
            and_(
                Question.difficulty >= game_data.difficulty_min,
                Question.difficulty <= game_data.difficulty_max
            )
        )

    all_questions = list(db.exec(stmt).all())

    if not all_questions:
        raise HTTPException(
            status_code=400,
            detail="Keine Fragen für dieses Thema verfügbar"
        )

    # Select random subset
    question_count = min(game_data.question_count or 10, len(all_questions))
    questions = sample(all_questions, question_count)

    # Create game session
    session = GameSession(
        mode=game_data.mode,
        status=GameStatus.ACTIVE,
        topic_id=topic_id,
        question_ids=[q.id for q in questions]
    )
    db.add(session)
    db.flush()

    # Add player to session
    session_player = SessionPlayers(
        session_id=session.id,
        user_id=current_user.id,
        hearts_left=3,
        score=0,
    )
    db.add(session_player)

    db.commit()
    db.refresh(session)

    return GameSessionResponse(
        session_id=session.id,
        mode=session.mode,
        topic_id=topic_id,
        topic_title=topic.title,
        total_questions=len(questions),
        time_limit=None,  # No predefined time limit for random games
    )


@router.get("/session/{session_id}/question/{question_index}", response_model=QuestionResponse)
async def get_question(
    session_id: int,
    question_index: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Get a specific question from the game session."""
    # Verify session exists and user is participant
    session = db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden")

    # Check if user is in session
    stmt = select(SessionPlayers).where(
        and_(
            SessionPlayers.session_id == session_id,
            SessionPlayers.user_id == current_user.id
        )
    )
    player = db.exec(stmt).first()
    if not player:
        raise HTTPException(
            status_code=403, detail="Nicht Teil dieser Session")

    # Check if question index is valid
    if not session.question_ids or question_index >= len(session.question_ids):
        raise HTTPException(status_code=404, detail="Frage nicht gefunden")

    # Get the question
    question_id = session.question_ids[question_index]
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Frage nicht gefunden")

    # Get answers for the question
    stmt = select(Answer).where(Answer.question_id == question_id)
    answers = list(db.exec(stmt).all())

    # Update session's current question index
    session.current_question_index = question_index
    session.updated_at = datetime.utcnow()
    db.commit()

    return QuestionResponse(
        question_id=question.id,
        question_number=question_index + 1,
        content=question.content,
        answers=[
            AnswerOption(id=a.id, content=a.content)
            for a in answers
        ],
        time_limit=30,  # 30 seconds per question
        show_timestamp=int(datetime.utcnow().timestamp() * 1000),
    )


@router.post("/session/{session_id}/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    session_id: int,
    answer_data: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Submit an answer for the current question."""
    # Verify session and player
    session = db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden")

    stmt = select(SessionPlayers).where(
        and_(
            SessionPlayers.session_id == session_id,
            SessionPlayers.user_id == current_user.id
        )
    )
    player = db.exec(stmt).first()
    if not player:
        raise HTTPException(
            status_code=403, detail="Nicht Teil dieser Session")

    # Get the answer and check if it's correct
    answer = db.get(Answer, answer_data.answer_id)
    if not answer or answer.question_id != answer_data.question_id:
        raise HTTPException(status_code=400, detail="Ungültige Antwort")

    # Calculate points based on response time
    response_time_ms = answer_data.answered_at - \
        int(session.updated_at.timestamp() * 1000)
    base_points = 100
    time_bonus = max(0, 100 - (response_time_ms // 300)
                     )  # Lose 1 point per 300ms
    points_earned = (base_points + time_bonus) if answer.is_correct else 0

    # Update player state
    if answer.is_correct:
        player.score += points_earned
    else:
        player.hearts_left = max(0, player.hearts_left - 1)

    # Save player answer
    player_answer = PlayerAnswer(
        session_id=session_id,
        question_id=answer_data.question_id,
        selected_answer_id=answer_data.answer_id,
        is_correct=answer.is_correct,
        points_awarded=points_earned,
        answer_time_ms=response_time_ms,
    )
    db.add(player_answer)

    # Get correct answer for response
    correct_answer_stmt = select(Answer).where(
        and_(
            Answer.question_id == answer_data.question_id,
            Answer.is_correct == True
        )
    )
    correct_answer = db.exec(correct_answer_stmt).first()

    # Get question for explanation
    question = db.get(Question, answer_data.question_id)

    db.commit()
    db.refresh(player)

    return SubmitAnswerResponse(
        is_correct=answer.is_correct,
        correct_answer_id=correct_answer.id if correct_answer else answer.id,
        points_earned=points_earned,
        response_time_ms=response_time_ms,
        player_score=player.score,
        player_hearts=player.hearts_left,
        explanation=question.explanation if question else None,
    )


@router.post("/session/{session_id}/complete", response_model=GameResultResponse)
async def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Complete a game session and get results."""
    # Verify session and player
    session = db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden")

    stmt = select(SessionPlayers).where(
        and_(
            SessionPlayers.session_id == session_id,
            SessionPlayers.user_id == current_user.id
        )
    )
    player = db.exec(stmt).first()
    if not player:
        raise HTTPException(
            status_code=403, detail="Nicht Teil dieser Session")

    # Update session status
    session.status = GameStatus.FINISHED
    session.ended_at = datetime.utcnow()

    # Calculate statistics
    stmt = select(PlayerAnswer).where(PlayerAnswer.session_id == session_id)
    player_answers = list(db.exec(stmt).all())

    questions_answered = len(player_answers)
    correct_answers = sum(1 for a in player_answers if a.is_correct)
    total_time_seconds = int(
        (session.ended_at - session.started_at).total_seconds())

    # Determine result
    result = "win" if player.hearts_left > 0 else "fail"

    # TODO: Calculate rank and percentile from leaderboard

    db.commit()

    return GameResultResponse(
        session_id=session.id,
        mode=session.mode,
        result=result,
        final_score=player.score,
        hearts_remaining=player.hearts_left,
        questions_answered=questions_answered,
        correct_answers=correct_answers,
        total_time_seconds=total_time_seconds,
        rank=None,  # To be implemented
        percentile=None,  # To be implemented
    )
