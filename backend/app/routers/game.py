"""
Game router for actual gameplay.
Supports both curated quizzes and dynamic topic-based questions.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from sqlalchemy import and_
from random import sample

from app.db.models import (
    Answer,
    GameMode,
    GameSession,
    GameStatus,
    PlayerAnswer,
    Question,
    Quiz,
    QuizQuestion,
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
    # Verify quiz exists
    quiz = db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz nicht gefunden")
    
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
    
    # Store quiz reference in session meta (we'll add this field)
    # For now, we'll track it separately
    
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
        raise HTTPException(status_code=403, detail="Nicht Teil dieser Session")
    
    # TODO: Implement question retrieval logic based on session type
    # For now, return mock data
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/session/{session_id}/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    session_id: int,
    answer_data: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Submit an answer for the current question."""
    # Implementation will follow
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/session/{session_id}/complete", response_model=GameResultResponse)
async def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Complete a game session and get results."""
    # Implementation will follow
    raise HTTPException(status_code=501, detail="Not implemented yet") 