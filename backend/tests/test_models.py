"""Tests for database models."""

import pytest
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from app.core.security import get_password_hash
from app.db.models import (
    Answer,
    Badge,
    Difficulty,
    GameMode,
    GameSession,
    GameStatus,
    Leaderboard,
    LeaderboardEntry,
    LeaderboardPeriod,
    Question,
    Quiz,
    Role,
    SessionPlayers,
    Topic,
    User,
    UserBadge,
)


@pytest.fixture(name="session")
def session_fixture():
    """Create test database session."""
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpassword"),
        is_verified=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


class TestUserModel:
    """Test User model functionality."""

    def test_create_user(self, session: Session):
        """Test creating a user."""
        user = User(
            email="test@example.com",
            password_hash=get_password_hash("testpassword"),
            is_verified=True,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.is_verified is True
        assert user.created_at is not None
        assert user.role_id is None

    def test_user_with_role(self, session: Session):
        """Test creating a user with a role."""
        role = Role(name="admin", description="Administrator")
        session.add(role)
        session.commit()
        session.refresh(role)

        user = User(
            email="admin@example.com",
            password_hash=get_password_hash("adminpass"),
            role_id=role.id,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        assert user.role_id == role.id

    def test_user_email_unique(self, session: Session):
        """Test that user email must be unique."""
        user1 = User(
            email="test@example.com",
            password_hash=get_password_hash("password1"),
        )
        user2 = User(
            email="test@example.com",
            password_hash=get_password_hash("password2"),
        )

        session.add(user1)
        session.commit()

        session.add(user2)

        # Should raise an integrity error due to unique constraint
        with pytest.raises(Exception):
            session.commit()


class TestRoleModel:
    """Test Role model functionality."""

    def test_create_role(self, session: Session):
        """Test creating a role."""
        role = Role(name="moderator", description="Moderator role")
        session.add(role)
        session.commit()
        session.refresh(role)

        assert role.id is not None
        assert role.name == "moderator"
        assert role.description == "Moderator role"


class TestTopicModel:
    """Test Topic model functionality."""

    def test_create_topic(self, session: Session):
        """Test creating a topic."""
        topic = Topic(title="Science", description="Science questions")
        session.add(topic)
        session.commit()
        session.refresh(topic)

        assert topic.id is not None
        assert topic.title == "Science"
        assert topic.description == "Science questions"


class TestQuestionModel:
    """Test the Question model."""

    def test_question_defaults(self, session: Session, topic: Topic):
        """Test default values for Question."""
        question = Question(
            topic_id=topic.id,
            difficulty=Difficulty.JOURNEYMAN,
            content="What is the speed of light?",
            explanation="The speed of light in a vacuum is a universal constant.",
        )
        session.add(question)
        session.commit()
        session.refresh(question)

        assert question.difficulty == Difficulty.JOURNEYMAN
        assert question.created_at is not None

    def test_question_topic_relationship(
        self, session: Session, topic: Topic, question: Question
    ):
        """Test the relationship between Question and Topic."""
        retrieved_question = session.get(Question, question.id)
        assert retrieved_question is not None

        retrieved_topic = session.get(Topic, retrieved_question.topic_id)
        assert retrieved_topic is not None
        assert retrieved_topic.id == topic.id


class TestAnswerModel:
    """Test the Answer model."""

    def test_answer_creation_and_retrieval(self, session: Session, question: Question):
        """Test creating and retrieving an Answer."""
        answer = Answer(
            question_id=question.id,
            content="Paris",
            is_correct=True,
        )
        session.add(answer)
        session.commit()
        session.refresh(answer)

        assert answer.id is not None
        assert answer.question_id == question.id
        assert answer.content == "Paris"
        assert answer.is_correct is True

    def test_answer_question_relationship(
        self, session: Session, question: Question, answer: Answer
    ):
        """Test the relationship between Answer and Question."""
        retrieved_answer = session.get(Answer, answer.id)
        assert retrieved_answer is not None

        retrieved_question = session.get(Question, retrieved_answer.question_id)
        assert retrieved_question is not None
        assert retrieved_question.id == question.id


class TestGameSessionModel:
    """Test the GameSession and related models."""

    def test_game_session_creation(self, session: Session):
        """Test creating a GameSession."""
        game_session = GameSession(
            mode=GameMode.SOLO,
            status=GameStatus.ACTIVE,
        )
        session.add(game_session)
        session.commit()
        session.refresh(game_session)

        assert game_session.id is not None
        assert game_session.mode == GameMode.SOLO
        assert game_session.status == GameStatus.ACTIVE
        assert game_session.started_at is not None

    def test_session_players_creation(
        self, session: Session, game_session: GameSession, test_user: User
    ):
        """Test creating a SessionPlayers entry."""
        session_player = SessionPlayers(
            session_id=game_session.id,
            user_id=test_user.id,
            hearts_left=2,
            score=150,
        )
        session.add(session_player)
        session.commit()

        retrieved = session.exec(
            select(SessionPlayers).where(
                SessionPlayers.session_id == game_session.id,
                SessionPlayers.user_id == test_user.id,
            )
        ).one()

        assert retrieved.hearts_left == 2
        assert retrieved.score == 150


class TestBadgeModel:
    """Test Badge model functionality."""

    def test_create_badge(self, session: Session):
        """Test creating a badge."""
        badge = Badge(
            title="First Quiz",
            description="Completed your first quiz",
            icon_path="/icons/first-quiz.png",
        )
        session.add(badge)
        session.commit()
        session.refresh(badge)

        assert badge.id is not None
        assert badge.title == "First Quiz"
        assert badge.description == "Completed your first quiz"
        assert badge.icon_path == "/icons/first-quiz.png"

    def test_user_badge_relationship(self, session: Session):
        """Test user-badge relationship."""
        user = User(
            email="user@example.com",
            password_hash=get_password_hash("userpass"),
        )
        badge = Badge(title="Test Badge", description="Test badge")

        session.add(user)
        session.add(badge)
        session.commit()
        session.refresh(user)
        session.refresh(badge)

        user_badge = UserBadge(
            user_id=user.id,
            badge_id=badge.id,
        )
        session.add(user_badge)
        session.commit()
        session.refresh(user_badge)

        assert user_badge.id is not None
        assert user_badge.user_id == user.id
        assert user_badge.badge_id == badge.id
        assert user_badge.achieved_at is not None


class TestLeaderboardModel:
    """Test Leaderboard model functionality."""

    def test_create_leaderboard(self, session: Session):
        """Test creating a leaderboard."""
        leaderboard = Leaderboard(
            mode=GameMode.DUEL,
            period=LeaderboardPeriod.WEEKLY,
        )
        session.add(leaderboard)
        session.commit()
        session.refresh(leaderboard)

        assert leaderboard.id is not None
        assert leaderboard.mode == GameMode.DUEL
        assert leaderboard.period == LeaderboardPeriod.WEEKLY
        assert leaderboard.created_at is not None

    def test_leaderboard_entry(self, session: Session):
        """Test creating leaderboard entries."""
        user = User(
            email="player@example.com",
            password_hash=get_password_hash("playerpass"),
        )
        leaderboard = Leaderboard(
            mode=GameMode.SOLO,
            period=LeaderboardPeriod.DAILY,
        )

        session.add(user)
        session.add(leaderboard)
        session.commit()
        session.refresh(user)
        session.refresh(leaderboard)

        entry = LeaderboardEntry(
            leaderboard_id=leaderboard.id,
            user_id=user.id,
            rank=1,
            score=500,
        )
        session.add(entry)
        session.commit()
        session.refresh(entry)

        assert entry.id is not None
        assert entry.leaderboard_id == leaderboard.id
        assert entry.user_id == user.id
        assert entry.rank == 1
        assert entry.score == 500


class TestEnums:
    """Test custom enum types."""

    def test_difficulty_values(self):
        """Test Difficulty enum values."""
        assert Difficulty.NOVICE == 1
        assert Difficulty.APPRENTICE == 2
        assert Difficulty.JOURNEYMAN == 3
        assert Difficulty.MASTER == 4
        assert Difficulty.GRANDMASTER == 5

    def test_leaderboard_period_values(self):
        """Test LeaderboardPeriod enum values."""
        assert LeaderboardPeriod.DAILY == "daily"
        assert LeaderboardPeriod.WEEKLY == "weekly"
        assert LeaderboardPeriod.MONTHLY == "monthly"

    def test_game_mode_values(self):
        """Test GameMode enum values."""
        assert GameMode.SOLO == "solo"
        assert GameMode.DUEL == "duel"
        assert GameMode.TEAM == "team"

    def test_game_status_values(self):
        """Test GameStatus enum values."""
        assert GameStatus.ACTIVE == "active"
        assert GameStatus.PAUSED == "paused"
        assert GameStatus.FINISHED == "finished"

    def test_question_creation_and_retrieval(self, session: Session, topic: Topic):
        """Test creating and retrieving a Question."""
        question = Question(
            topic_id=topic.id,
            difficulty=Difficulty.NOVICE,
            content="What is the capital of France?",
        )
        session.add(question)
        session.commit()
        session.refresh(question)

        assert question.id is not None
        assert question.topic_id == topic.id
        assert question.difficulty == Difficulty.NOVICE
        assert question.content == "What is the capital of France?"
        assert question.explanation is None
        assert question.created_at is not None

    def test_quiz_creation_and_retrieval(self, session: Session, topic: Topic):
        """Test creating and retrieving a Quiz."""
        quiz = Quiz(
            topic_id=topic.id,
            difficulty=Difficulty.NOVICE,
            title="French Capitals Quiz",
        )
        session.add(quiz)
        session.commit()
        session.refresh(quiz)

        assert quiz.id is not None
        assert quiz.topic_id == topic.id
        assert quiz.difficulty == Difficulty.NOVICE
        assert quiz.title == "French Capitals Quiz"
        assert quiz.created_at is not None
