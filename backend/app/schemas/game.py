"""Schemas for game functionality.

Defines all Pydantic schema models used in the game API.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, root_validator, validator

from app.db.models import GameMode


class GameSessionCreate(BaseModel):
    """Request model for creating a game session."""

    mode: GameMode = Field(..., description="Spielmodus (solo, comp, collab)")

    # For random games
    question_count: Optional[int] = Field(
        10, ge=5, le=50, description="Anzahl der Fragen für zufällige Themen-Spiele"
    )

    difficulty_min: Optional[int] = Field(
        None, ge=1, le=5, description="Minimale Schwierigkeitsstufe (1-5)"
    )

    difficulty_max: Optional[int] = Field(
        None, ge=1, le=5, description="Maximale Schwierigkeitsstufe (1-5)"
    )

    @validator("mode")
    def validate_game_mode(cls, v: Any) -> Any:
        """Validiere den Spielmodus."""
        valid_modes = [mode.value for mode in GameMode]
        if hasattr(v, 'value') and v.value.lower() not in valid_modes:
            raise ValueError(
                f"Ungültiger Spielmodus. Erlaubte Werte: {', '.join(valid_modes)}"
            )
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
    def validate_difficulty_range_values(
        cls, v: Optional[int], values: Dict[str, Any], **kwargs: Any
    ) -> Optional[int]:
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

    @validator("content")
    def validate_content(cls, v: str) -> str:
        """Validiere den Antwortinhalt."""
        if not v or not v.strip():
            raise ValueError("Antwortinhalt darf nicht leer sein")
        if len(v) > 500:
            raise ValueError(
                "Antwortinhalt darf nicht länger als 500 Zeichen sein")
        return v


class QuestionResponse(BaseModel):
    """Response model for a game question."""

    question_id: int
    question_number: int = Field(
        ..., ge=1, description="Fragennummer (beginnend bei 1)"
    )
    content: str = Field(..., min_length=1, max_length=1000,
                         description="Fragetext")
    answers: List[AnswerOption] = Field(..., description="Antwortoptionen")
    time_limit: int = Field(
        30, ge=10, le=300, description="Zeitlimit in Sekunden")
    show_timestamp: int = Field(
        ...,
        description="Unix-Zeitstempel in Millisekunden, wann die Frage angezeigt wurde",
    )

    @validator("content")
    def validate_content(cls, v: str) -> str:
        """Validiere den Frageinhalt."""
        if not v or not v.strip():
            raise ValueError("Frageinhalt darf nicht leer sein")
        return v

    @validator("show_timestamp")
    def validate_timestamp(cls, v: int) -> int:
        """Validiere den Zeitstempel."""
        current_time = int(datetime.utcnow().timestamp() * 1000)
        # Timestamp can't be from the future
        if v > current_time + 5000:  # Allow 5 seconds for clock differences
            raise ValueError(
                "Ungültiger Zeitstempel: Zeitstempel kann nicht aus der Zukunft sein"
            )
        # Timestamp can't be too old (e.g., 1 hour)
        if v < current_time - 3600000:
            raise ValueError("Ungültiger Zeitstempel: Zeitstempel ist zu alt")
        return v

    @validator("answers")
    def validate_answers(cls, v: List[AnswerOption]) -> List[AnswerOption]:
        """Validiere die Antwortoptionen."""
        if len(v) < 2:
            raise ValueError(
                "Mindestens zwei Antwortoptionen sind erforderlich")
        if len(v) > 10:
            raise ValueError("Maximal zehn Antwortoptionen sind erlaubt")
        return v


class SubmitAnswerRequest(BaseModel):
    """Request model for submitting an answer."""

    question_id: int
    answer_id: int
    answered_at: int = Field(
        ..., description="Unix timestamp in milliseconds when answer was submitted"
    )

    @validator("answered_at")
    def validate_timestamp(cls, v: int) -> int:
        """Validiere den Zeitstempel."""
        current_time = int(datetime.utcnow().timestamp() * 1000)
        # Answer can't be from the future
        if v > current_time + 5000:  # Allow 5 seconds for clock differences
            raise ValueError(
                "Ungültiger Zeitstempel: Antwort kann nicht aus der Zukunft kommen"
            )
        # Answer can't be too old (e.g., 1 hour)
        if v < current_time - 3600000:
            raise ValueError("Ungültiger Zeitstempel: Antwort ist zu alt")
        return v


class SubmitAnswerResponse(BaseModel):
    """Response model for answer submission."""

    is_correct: bool
    correct_answer_id: int
    points_earned: int = Field(
        ..., ge=0, description="Erzielte Punkte für diese Antwort"
    )
    response_time_ms: int = Field(...,
                                  description="Antwortzeit in Millisekunden")
    player_score: int = Field(..., ge=0, description="Aktueller Spielerstand")
    player_hearts: int = Field(
        ..., ge=0, le=3, description="Verbleibende Leben des Spielers"
    )
    explanation: Optional[str] = Field(
        None, max_length=1000, description="Erklärung zur Antwort"
    )


class GameResultResponse(BaseModel):
    """Response model for game completion."""

    session_id: int
    mode: GameMode
    result: str = Field(..., description="Spielergebnis (win oder fail)")
    final_score: int = Field(..., ge=0, description="Endgültiger Punktestand")
    hearts_remaining: int = Field(..., ge=0, le=3,
                                  description="Verbleibende Leben")
    questions_answered: int = Field(
        ..., ge=0, description="Anzahl der beantworteten Fragen"
    )
    correct_answers: int = Field(
        ..., ge=0, description="Anzahl der korrekt beantworteten Fragen"
    )
    total_time_seconds: int = Field(
        ..., ge=0, description="Gesamtspielzeit in Sekunden"
    )
    rank: Optional[int] = Field(
        None, ge=1, description="Rang in der Bestenliste")
    percentile: Optional[float] = Field(
        None, ge=0, le=100, description="Perzentilrang (0-100)"
    )

    @validator("result")
    def validate_result(cls, v: str) -> str:
        """Validate that result is either 'win' or 'fail'."""
        if v not in ["win", "fail"]:
            raise ValueError("Ergebnis muss entweder 'win' oder 'fail' sein")
        return v

    @validator("correct_answers", "questions_answered")
    def validate_answers_count(cls, v: int, values: Dict[str, Any]) -> int:
        """Validiere die Fragenanzahl."""
        if "questions_answered" in values and "correct_answers" in values:
            if values["correct_answers"] > values["questions_answered"]:
                raise ValueError(
                    "Anzahl der korrekten Antworten kann nicht größer sein als die Anzahl der beantworteten Fragen"
                )
        return v


class SessionJoinResponse(BaseModel):
    """Response model for joining an existing game session."""

    session_id: str
    mode: str
    players: List[Dict[str, Any]
                  ] = Field(..., description="List of players in the session")
    current_question: int = Field(..., ge=0,
                                  description="Current question index")
    total_questions: int = Field(..., ge=1,
                                 description="Total number of questions in the session")
    quiz_id: Optional[int] = Field(
        None, description="Quiz ID if this is a quiz-based session")
    topic_id: Optional[int] = Field(
        None, description="Topic ID if this is a topic-based session")
