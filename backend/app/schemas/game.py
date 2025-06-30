"""Schemas for game functionality.

Defines all Pydantic schema models used in the game API.
"""

from datetime import datetime
from typing import List, Optional, Union

from pydantic import BaseModel, Field, validator

from app.db.models import GameMode


class GameSessionCreate(BaseModel):
    """Request model for creating a game session."""

    mode: GameMode = Field(..., description="Game mode (solo, comp, collab)")
    # For random games
    question_count: Optional[int] = Field(
        10,
        ge=5,
        le=50,
        description="Number of questions for random topic games"
    )
    difficulty_min: Optional[int] = Field(
        None,
        ge=1,
        le=5,
        description="Minimum difficulty level (1-5)"
    )
    difficulty_max: Optional[int] = Field(
        None,
        ge=1,
        le=5,
        description="Maximum difficulty level (1-5)"
    )

    @validator("difficulty_max")
    def validate_difficulty_range(cls, v, values):
        """Validate that difficulty_max is >= difficulty_min."""
        if (
            v is not None
            and values.get("difficulty_min") is not None
            and v < values.get("difficulty_min")
        ):
            raise ValueError(
                "Maximale Schwierigkeit muss größer oder gleich der minimalen Schwierigkeit sein")
        return v


class GameSessionResponse(BaseModel):
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


class QuestionResponse(BaseModel):
    """Response model for a game question."""

    question_id: int
    question_number: int
    content: str
    answers: List[AnswerOption]
    time_limit: int = Field(
        30, ge=10, le=300, description="Time limit in seconds")
    show_timestamp: int = Field(
        ..., description="Unix timestamp in milliseconds when question was shown")


class SubmitAnswerRequest(BaseModel):
    """Request model for submitting an answer."""

    question_id: int
    answer_id: int
    answered_at: int = Field(
        ..., description="Unix timestamp in milliseconds when answer was submitted")


class SubmitAnswerResponse(BaseModel):
    """Response model for answer submission."""

    is_correct: bool
    correct_answer_id: int
    points_earned: int
    response_time_ms: int
    player_score: int
    player_hearts: int
    explanation: Optional[str] = None


class GameResultResponse(BaseModel):
    """Response model for game completion."""

    session_id: int
    mode: GameMode
    result: str = Field(..., description="win or fail")
    final_score: int
    hearts_remaining: int
    questions_answered: int
    correct_answers: int
    total_time_seconds: int
    rank: Optional[int] = None
    percentile: Optional[float] = Field(
        None, ge=0, le=100, description="Percentile rank (0-100)")

    @validator("result")
    def validate_result(cls, v):
        """Validate that result is either 'win' or 'fail'."""
        if v not in ["win", "fail"]:
            raise ValueError("Ergebnis muss entweder 'win' oder 'fail' sein")
        return v
