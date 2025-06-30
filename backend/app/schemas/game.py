"""Schemas for game functionality.

Defines all Pydantic schema models used in the game API.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field, validator, root_validator

from app.db.models import GameMode


class GameSessionCreate(BaseModel):
    """Request model for creating a game session."""

    mode: GameMode = Field(
        ...,
        description="Spielmodus (solo, comp, collab)"
    )

    # For random games
    question_count: Optional[int] = Field(
        10,
        ge=5,
        le=50,
        description="Anzahl der Fragen für zufällige Themen-Spiele"
    )

    difficulty_min: Optional[int] = Field(
        None,
        ge=1,
        le=5,
        description="Minimale Schwierigkeitsstufe (1-5)"
    )

    difficulty_max: Optional[int] = Field(
        None,
        ge=1,
        le=5,
        description="Maximale Schwierigkeitsstufe (1-5)"
    )

    @validator("mode")
    def validate_game_mode(cls, v: Any) -> Any:
        """Validiere den Spielmodus."""
        valid_modes = [mode.value for mode in GameMode]
        if v.value not in valid_modes:
            raise ValueError(
                f"Ungültiger Spielmodus. Erlaubte Werte: {', '.join(valid_modes)}")
        return v

    @validator("question_count")
    def validate_question_count(cls, v: Optional[int]) -> Optional[int]:
        """Validiere die Fragenanzahl."""
        if v is not None:
            if v < 5:
                raise ValueError("Fragenanzahl muss mindestens 5 sein")
            if v > 50:
                raise ValueError("Fragenanzahl darf maximal 50 sein")
        return v

    @validator("difficulty_min", "difficulty_max")
    def validate_difficulty_range_values(cls, v: Optional[int], values: Dict[str, Any], **kwargs: Any) -> Optional[int]:
        """Validiere die einzelnen Schwierigkeitswerte."""
        if v is not None:
            if v < 1:
                raise ValueError("Schwierigkeitswert muss mindestens 1 sein")
            if v > 5:
                raise ValueError("Schwierigkeitswert darf maximal 5 sein")
        return v

    @root_validator(pre=True)
    def validate_difficulty_range(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        """Validiere die Schwierigkeitsspanne."""
        min_diff = values.get("difficulty_min")
        max_diff = values.get("difficulty_max")

        if min_diff is not None and max_diff is not None:
            if max_diff < min_diff:
                raise ValueError(
                    "Maximale Schwierigkeit muss größer oder gleich der minimalen Schwierigkeit sein"
                )

        return values


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

    @validator("answered_at")
    def validate_timestamp(cls, v: int) -> int:
        """Validiere den Zeitstempel."""
        current_time = int(datetime.utcnow().timestamp() * 1000)
        # Answer can't be from the future
        if v > current_time + 5000:  # Allow 5 seconds for clock differences
            raise ValueError(
                "Ungültiger Zeitstempel: Antwort kann nicht aus der Zukunft kommen")
        # Answer can't be too old (e.g., 1 hour)
        if v < current_time - 3600000:
            raise ValueError("Ungültiger Zeitstempel: Antwort ist zu alt")
        return v


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
    def validate_result(cls, v: str) -> str:
        """Validate that result is either 'win' or 'fail'."""
        if v not in ["win", "fail"]:
            raise ValueError("Ergebnis muss entweder 'win' oder 'fail' sein")
        return v
