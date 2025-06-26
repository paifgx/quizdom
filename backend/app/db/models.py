"""Database models for Quizdom."""

from __future__ import annotations

from datetime import datetime
from enum import Enum, IntEnum
from typing import Optional

from sqlmodel import Field, SQLModel


class GameMode(str, Enum):
    """Game modes available in Quizdom."""

    SOLO = "solo"
    DUEL = "duel"
    TEAM = "team"


class GameStatus(str, Enum):
    """Status of a game session."""

    ACTIVE = "active"
    PAUSED = "paused"
    FINISHED = "finished"


class Difficulty(IntEnum):
    """Question difficulty from 1 (easy) to 5 (hard)."""

    ONE = 1
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5


class LeaderboardPeriod(str, Enum):
    """Time period for leaderboards."""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class Role(SQLModel, table=True):
    """User roles."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None


class User(SQLModel, table=True):
    """Application users."""

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    role_id: Optional[int] = Field(default=None, foreign_key="role.id")


class GameSession(SQLModel, table=True):
    """Quiz game sessions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    mode: GameMode
    status: GameStatus
    score: int = 0
    started_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class Topic(SQLModel, table=True):
    """Question topics."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None


class Question(SQLModel, table=True):
    """Quiz questions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="topic.id")
    difficulty: Difficulty
    content: str
    explanation: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Answer(SQLModel, table=True):
    """Possible answers to a question."""

    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int = Field(foreign_key="question.id")
    content: str
    is_correct: bool = False


class Quiz(SQLModel, table=True):
    """Quiz definitions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    topic_id: int = Field(foreign_key="topic.id")
    difficulty: Difficulty
    time_limit_minutes: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QuizQuestion(SQLModel, table=True):
    """Relationship between quizzes and questions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    quiz_id: int = Field(foreign_key="quiz.id")
    question_id: int = Field(foreign_key="question.id")
    order: int = Field(default=0)  # Order of questions in the quiz


class PlayerAnswer(SQLModel, table=True):
    """Answers a player gave in a game session."""

    id: Optional[int] = Field(default=None, primary_key=True)
    game_session_id: int = Field(foreign_key="gamesession.id")
    question_id: int = Field(foreign_key="question.id")
    selected_answer_id: int = Field(foreign_key="answer.id")
    is_correct: bool
    points_awarded: int
    answered_at: datetime = Field(default_factory=datetime.utcnow)


class Badge(SQLModel, table=True):
    """Badges awarded to users."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    icon_path: Optional[str] = None


class UserBadge(SQLModel, table=True):
    """Relationship between users and badges."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    badge_id: int = Field(foreign_key="badge.id")
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
    leaderboard_id: int = Field(foreign_key="leaderboard.id")
    user_id: int = Field(foreign_key="user.id")
    rank: int
    score: int


class RefreshToken(SQLModel, table=True):
    """Refresh token used for authentication."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token_hash: str
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    revoked_at: Optional[datetime] = None
