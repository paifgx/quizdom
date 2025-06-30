"""Schemas for game functionality."""

from datetime import datetime
from typing import List, Optional, Union

from pydantic import BaseModel

from app.db.models import GameMode


class StartGameModel(BaseModel):
    """Request model for creating a game session."""

    mode: Union[str, GameMode]
    quiz_id: Optional[int] = None
    topic_id: Optional[int] = None
    # For random games
    question_count: Optional[int] = 10
    difficulty_min: Optional[int] = None
    difficulty_max: Optional[int] = None


class GameSessionModel(BaseModel):
    """Response model for game session creation."""

    session_id: int
    mode: GameMode
    # Either quiz or topic info
    quiz_id: Optional[int] = None
    quiz_title: Optional[str] = None
    topic_id: Optional[int] = None
    topic_title: Optional[str] = None
    total_questions: int
    time_limit: Optional[int] = None


class AnswerOption(BaseModel):
    """Answer option for a question."""

    id: int
    content: str


class QuestionModel(BaseModel):
    """Response model for a game question."""

    question_id: int
    question_number: int
    content: str
    answers: List[AnswerOption]
    time_limit: int = 30  # seconds
    show_timestamp: int  # Unix timestamp in milliseconds


class SubmitAnswerModel(BaseModel):
    """Request model for submitting an answer."""

    question_id: int
    answer_id: int
    answered_at: int  # Unix timestamp in milliseconds


class AnswerResponseModel(BaseModel):
    """Response model for answer submission."""

    is_correct: bool
    correct_answer_id: int
    points_earned: int
    player_score: int
    explanation: Optional[str] = None


class GameResultModel(BaseModel):
    """Response model for game completion."""

    session_id: int
    mode: GameMode
    result: str  # "win" or "fail"
    final_score: int
    hearts_remaining: int
    questions_answered: int
    correct_answers: int
    total_time_seconds: int
    # For leaderboard
    rank: Optional[int] = None
    percentile: Optional[float] = None


# Additional schemas for game.py

class GameSessionCreate(BaseModel):
    """Request model for creating a game session"""

    mode: GameMode
    question_count: Optional[int] = 10
    difficulty_min: Optional[int] = None
    difficulty_max: Optional[int] = None


class GameSessionResponse(BaseModel):
    """Response model for game session creation"""

    session_id: int
    mode: GameMode
    quiz_id: Optional[int] = None
    quiz_title: Optional[str] = None
    topic_id: Optional[int] = None
    topic_title: Optional[str] = None
    total_questions: int
    time_limit: Optional[int] = None


class QuestionResponse(BaseModel):
    """Response model for a game question"""

    question_id: int
    question_number: int
    content: str
    answers: List[AnswerOption]
    time_limit: int = 30
    show_timestamp: int


class SubmitAnswerRequest(BaseModel):
    """Request model for submitting an answer"""

    question_id: int
    answer_id: int
    answered_at: int  # Unix timestamp in milliseconds


class SubmitAnswerResponse(BaseModel):
    """Response model for answer submission"""

    is_correct: bool
    correct_answer_id: int
    points_earned: int
    response_time_ms: int
    player_score: int
    player_hearts: int
    explanation: Optional[str] = None


class GameResultResponse(BaseModel):
    """Response model for game completion"""

    session_id: int
    mode: GameMode
    result: str  # "win" or "fail"
    final_score: int
    hearts_remaining: int
    questions_answered: int
    correct_answers: int
    total_time_seconds: int
    rank: Optional[int] = None
    percentile: Optional[float] = None
