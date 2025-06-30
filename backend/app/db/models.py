"""Database models for Quizdom."""

from __future__ import annotations

from datetime import datetime
from enum import Enum, IntEnum
from typing import Any, Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class GameMode(str, Enum):
    """Game modes available in Quizdom."""

    SOLO = "solo"
    COMP = "comp"
    COLLAB = "collab"


class GameStatus(str, Enum):
    """Status of a game session."""

    ACTIVE = "active"
    PAUSED = "paused"
    FINISHED = "finished"


class Difficulty(IntEnum):
    """Question difficulty from 1 (novice) to 5 (grandmaster)."""

    NOVICE = 1
    APPRENTICE = 2
    JOURNEYMAN = 3
    MASTER = 4
    GRANDMASTER = 5


class LeaderboardPeriod(str, Enum):
    """Time period for leaderboards."""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class EmailTokenType(str, Enum):
    """Types of email tokens."""

    VERIFY = "verify"
    RESET = "reset"


class MediaType(str, Enum):
    """Media types for question media."""

    PNG = "png"
    GIF = "gif"
    MP3 = "mp3"


class Role(SQLModel, table=True):
    """User roles."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None


class User(SQLModel, table=True):
    """Application users."""

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    nickname: Optional[str] = None
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None


class UserRoles(SQLModel, table=True):
    """Many-to-many relationship between users and roles."""

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    role_id: int = Field(foreign_key="role.id", primary_key=True)
    granted_at: datetime = Field(default_factory=datetime.utcnow)


class Wallet(SQLModel, table=True):
    """User wallet for wisecoins."""

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    wisecoins: int = Field(default=0)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RefreshToken(SQLModel, table=True):
    """Refresh token used for authentication."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    token_hash: str = Field(index=True)
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    revoked_at: Optional[datetime] = None


class EmailTokens(SQLModel, table=True):
    """Tokens for email verification and password reset."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    token: str = Field(unique=True, index=True)
    type: EmailTokenType
    expires_at: datetime


class AuditLogs(SQLModel, table=True):
    """Audit logs for tracking user actions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    actor_id: int = Field(foreign_key="user.id", index=True)
    target_id: Optional[int] = None  # ID of the affected entity
    action: str  # e.g., "user.create", "quiz.delete", etc.
    meta: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GameSession(SQLModel, table=True):
    """Quiz game sessions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    mode: GameMode
    status: GameStatus
    # Track source of questions
    quiz_id: Optional[int] = Field(default=None, foreign_key="quiz.id")
    topic_id: Optional[int] = Field(default=None, foreign_key="topic.id")
    question_ids: Optional[list[int]] = Field(default=None, sa_column=Column(JSON))
    current_question_index: int = Field(default=0)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class SessionPlayers(SQLModel, table=True):
    """Players in a game session."""

    session_id: int = Field(foreign_key="gamesession.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    hearts_left: int = Field(default=3)
    score: int = Field(default=0)


class Topic(SQLModel, table=True):
    """Question topics."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(unique=True, index=True)
    description: Optional[str] = None


class Question(SQLModel, table=True):
    """Quiz questions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="topic.id", index=True)
    difficulty: int
    content: str
    explanation: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Answer(SQLModel, table=True):
    """Possible answers to a question."""

    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int = Field(foreign_key="question.id", index=True)
    content: str
    is_correct: bool = Field(default=False)


class QuestionMedia(SQLModel, table=True):
    """Media files associated with questions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int = Field(foreign_key="question.id", index=True)
    url: str
    media_type: MediaType


class PlayerAnswer(SQLModel, table=True):
    """Answers a player gave in a game session."""

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="gamesession.id", index=True)
    question_id: int = Field(foreign_key="question.id")
    selected_answer_id: int = Field(foreign_key="answer.id")
    is_correct: bool
    points_awarded: int
    answer_time_ms: int  # Response time in milliseconds
    answered_at: datetime = Field(default_factory=datetime.utcnow)


class UserQuestionStar(SQLModel, table=True):
    """Starred questions by users."""

    user_id: int = Field(foreign_key="user.id", primary_key=True)
    question_id: int = Field(foreign_key="question.id", primary_key=True)
    starred_at: datetime = Field(default_factory=datetime.utcnow)


class Badge(SQLModel, table=True):
    """Badges awarded to users."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(unique=True, index=True)
    description: Optional[str] = None
    icon_path: Optional[str] = None


class UserBadge(SQLModel, table=True):
    """Relationship between users and badges."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    badge_id: int = Field(foreign_key="badge.id", index=True)
    achieved_at: datetime = Field(default_factory=datetime.utcnow)


class Leaderboard(SQLModel, table=True):
    """Leaderboard container."""

    id: Optional[int] = Field(default=None, primary_key=True)
    mode: GameMode
    period: LeaderboardPeriod
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LeaderboardEntry(SQLModel, table=True):
    """Entries within a leaderboard."""

    id: Optional[int] = Field(default=None, primary_key=True)
    leaderboard_id: int = Field(foreign_key="leaderboard.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    rank: int
    score: int


# The following models remain from the original implementation but are not in the ERM


class QuizStatus(str, Enum):
    """Quiz publication status."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Quiz(SQLModel, table=True):
    """Quiz definitions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    topic_id: int = Field(foreign_key="topic.id")
    difficulty: int
    time_limit_minutes: Optional[int] = None
    status: QuizStatus = Field(default=QuizStatus.DRAFT)
    published_at: Optional[datetime] = None
    play_count: int = Field(default=0)
    image_data: Optional[bytes] = None
    image_filename: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QuizQuestion(SQLModel, table=True):
    """Relationship between quizzes and questions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    quiz_id: int = Field(foreign_key="quiz.id")
    question_id: int = Field(foreign_key="question.id")
    order: int = Field(default=0)  # Order of questions in the quiz
