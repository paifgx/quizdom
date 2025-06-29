"""Pydantic schemas for quiz administration."""

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.db.models import Difficulty

# Allowed difficulty aliases mapping (lowercase) to Difficulty enum
_DIFFICULTY_ALIAS: dict[str, Difficulty] = {
    "anfänger": Difficulty.NOVICE,
    "anfaenger": Difficulty.NOVICE,
    "lehrling": Difficulty.APPRENTICE,
    "geselle": Difficulty.JOURNEYMAN,
    "meister": Difficulty.MASTER,
    "großmeister": Difficulty.GRANDMASTER,
    "grossmeister": Difficulty.GRANDMASTER,
    # Legacy aliases
    "easy": Difficulty.NOVICE,
    "medium": Difficulty.JOURNEYMAN,
    "hard": Difficulty.GRANDMASTER,
}


class _DifficultyAliasMixin(BaseModel):
    """Mixin that converts difficulty aliases to Difficulty enum."""

    # Add the difficulty field that the validator validates
    difficulty: Difficulty

    @classmethod
    def _convert_difficulty(cls, v: Any) -> Difficulty:
        if isinstance(v, Difficulty):
            return v
        if isinstance(v, int):
            try:
                return Difficulty(v)
            except ValueError as exc:
                raise ValueError("Ungültiger Schwierigkeitswert") from exc
        if isinstance(v, str):
            alias = _DIFFICULTY_ALIAS.get(v.lower())
            if alias:
                return alias
        raise ValueError("Ungültiger Schwierigkeitswert")

    # NOTE: Pydantic v2 field validators run before dataclass conversion
    @field_validator("difficulty", mode="before")
    @classmethod
    def validate_difficulty(cls, v: Any) -> Difficulty:  # noqa: N805
        return cls._convert_difficulty(v)


class TopicBase(BaseModel):
    """Base schema for topics."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class TopicCreate(TopicBase):
    """Schema for creating a topic."""

    pass


class TopicUpdate(BaseModel):
    """Schema for updating a topic."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class TopicResponse(TopicBase):
    """Schema for topic responses."""

    id: int
    model_config = ConfigDict(from_attributes=True)


class AnswerBase(BaseModel):
    """Base schema for answers."""

    content: str = Field(..., min_length=1)
    is_correct: bool = False


class AnswerCreate(AnswerBase):
    """Schema for creating an answer."""

    pass


class AnswerResponse(AnswerBase):
    """Schema for answer responses."""

    id: int
    model_config = ConfigDict(from_attributes=True)


class QuestionBase(_DifficultyAliasMixin):
    """Base schema for questions."""

    topic_id: int
    difficulty: Difficulty
    content: str = Field(..., min_length=1)
    explanation: Optional[str] = None


class QuestionCreate(QuestionBase):
    """Schema for creating a question with answers."""

    answers: List[AnswerCreate]

    @field_validator("answers")
    @classmethod
    def validate_answers_length(cls, v: List[AnswerCreate]) -> List[AnswerCreate]:
        if len(v) < 2 or len(v) > 6:
            raise ValueError("Fragen müssen zwischen 2 und 6 Antworten haben")
        return v


class QuestionUpdate(BaseModel):
    """Schema for updating a question."""

    topic_id: Optional[int] = None
    difficulty: Optional[Difficulty] = None
    content: Optional[str] = Field(None, min_length=1)
    explanation: Optional[str] = None


class QuestionResponse(QuestionBase):
    """Schema for question responses."""

    id: int
    created_at: datetime
    answers: List[AnswerResponse]
    topic: TopicResponse
    model_config = ConfigDict(from_attributes=True)


class QuizBase(_DifficultyAliasMixin):
    """Base schema for quizzes."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    topic_id: int
    difficulty: Difficulty
    time_limit_minutes: Optional[int] = Field(None, ge=1, le=180)


class QuizCreate(QuizBase):
    """Schema for creating a quiz."""

    question_ids: List[int] = []

    @field_validator("question_ids")
    @classmethod
    def validate_question_ids(cls, v: List[int]) -> List[int]:
        return v


class QuizUpdate(BaseModel):
    """Schema for updating a quiz."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    topic_id: Optional[int] = None
    difficulty: Optional[Difficulty] = None
    time_limit_minutes: Optional[int] = Field(None, ge=1, le=180)
    question_ids: Optional[List[int]] = None


class QuizResponse(QuizBase):
    """Schema for quiz responses."""

    id: int
    created_at: datetime
    topic: TopicResponse
    question_count: int
    has_image: bool = False  # Indicates if quiz has an image
    model_config = ConfigDict(from_attributes=True)


class QuizDetailResponse(QuizResponse):
    """Schema for detailed quiz responses with questions."""

    questions: List[QuestionResponse]
    model_config = ConfigDict(from_attributes=True)


class QuizBatchCreate(BaseModel):
    """Schema for creating a quiz with questions in a single batch."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: Difficulty
    time_limit_minutes: Optional[int] = Field(None, ge=1, le=180)
    questions: List[QuestionCreate]

    @field_validator("questions")
    @classmethod
    def validate_questions(cls, v: List[QuestionCreate]) -> List[QuestionCreate]:
        if len(v) == 0:
            raise ValueError("Mindestens eine Frage ist erforderlich")
        return v


class ImageUploadResponse(BaseModel):
    """Response schema for image upload."""

    message: str = Field(..., description="Upload success message")
    filename: str = Field(..., description="Original filename")
    quiz_id: int = Field(..., description="Quiz ID that image was uploaded to")


class ErrorResponse(BaseModel):
    """Schema for error responses."""

    detail: str
    code: Optional[str] = None
    field: Optional[str] = None
    hint: Optional[str] = None
