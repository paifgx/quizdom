"""Unit tests for GameService."""

from datetime import datetime

import pytest
from freezegun import freeze_time
from sqlmodel import select

from app.db.models import Answer, GameMode, GameStatus, QuizStatus, SessionPlayers, User
from app.services.game_service import GameService
from tests.factories import create_quiz


@pytest.fixture
def user():
    """Test user fixture."""
    return User(
        id=1,
        email="test@example.com",
        password_hash="test_hash",
        is_verified=True,
        created_at=datetime.utcnow(),
    )


@pytest.fixture
def game_service(session):
    """Game service fixture."""
    return GameService(session)


class TestStartQuizGame:
    """Tests for start_quiz_game method."""

    def test_start_quiz_game_solo(self, session, game_service, user):
        """Test starting a quiz game in solo mode."""
        quiz = create_quiz(session, n=5)

        game_session = game_service.start_quiz_game(user, quiz.id, GameMode.SOLO)

        assert game_session.mode == GameMode.SOLO
        assert game_session.status == GameStatus.ACTIVE
        assert game_session.quiz_id == quiz.id
        assert len(game_session.question_ids) == 5
        assert game_session.current_question_index == 0

        # Check player was added with 3 hearts
        session_player = session.exec(
            select(SessionPlayers).where(SessionPlayers.session_id == game_session.id)
        ).first()
        assert session_player is not None
        assert session_player.hearts_left == 3
        assert session_player.score == 0

    def test_start_quiz_game_invalid_quiz(self, game_service, user):
        """Test starting with invalid quiz ID."""
        with pytest.raises(ValueError, match="Quiz nicht gefunden"):
            game_service.start_quiz_game(user, 9999, GameMode.SOLO)

    def test_start_quiz_game_draft_quiz(self, session, game_service, user):
        """Test starting with a draft quiz."""
        # Create quiz but don't publish it
        quiz = create_quiz(session, n=5)
        quiz.status = QuizStatus.DRAFT
        session.add(quiz)
        session.commit()

        with pytest.raises(ValueError, match="Quiz ist nicht veröffentlicht"):
            game_service.start_quiz_game(user, quiz.id, GameMode.SOLO)


class TestSubmitAnswer:
    """Tests for submit_answer method."""

    @pytest.fixture
    def active_quiz_session(self, session, game_service, user):
        """Fixture providing an active game session."""
        quiz = create_quiz(session, n=5)
        game_session = game_service.start_quiz_game(user, quiz.id, GameMode.SOLO)
        return game_session

    @pytest.fixture
    def question_answer_ids(self, session, active_quiz_session):
        """Get first question ID and its correct/incorrect answer IDs."""
        question_id = active_quiz_session.question_ids[0]

        answers = list(
            session.exec(select(Answer).where(Answer.question_id == question_id)).all()
        )

        correct_answer = next((a for a in answers if a.is_correct), None)
        incorrect_answer = next((a for a in answers if not a.is_correct), None)

        if not correct_answer or not incorrect_answer:
            raise ValueError("Could not find both correct and incorrect answers")

        return {
            "question_id": question_id,
            "correct_answer_id": correct_answer.id,
            "incorrect_answer_id": incorrect_answer.id,
        }

    @freeze_time("2023-01-01 12:00:00")
    @pytest.mark.parametrize(
        "mode,is_correct,response_time_ms,expected_points,expected_hearts",
        [
            # SOLO mode scoring matrix
            (GameMode.SOLO, True, 2000, 100, 3),  # Fast correct answer
            (GameMode.SOLO, True, 5000, 50, 3),  # Medium correct answer
            (GameMode.SOLO, True, 7000, 25, 3),  # Slow correct answer
            (GameMode.SOLO, False, 2000, 0, 2),  # Wrong answer loses heart
            # COMP mode scoring matrix
            (GameMode.COMP, True, 2000, 100, 3),  # Fast correct answer
            (GameMode.COMP, True, 5000, 50, 3),  # Medium correct answer
            (GameMode.COMP, True, 7000, 25, 3),  # Slow correct answer
            (GameMode.COMP, False, 2000, 0, 2),  # Wrong answer loses heart
            # COLLAB mode scoring matrix
            (GameMode.COLLAB, True, 2000, 100, 3),  # Fast correct answer
            (GameMode.COLLAB, True, 5000, 50, 3),  # Medium correct answer
            (GameMode.COLLAB, True, 7000, 25, 3),  # Slow correct answer
            # Wrong answer doesn't lose heart in collab mode
            (GameMode.COLLAB, False, 2000, 0, 3),
        ],
    )
    def test_submit_answer_scoring_matrix(
        self,
        session,
        user,
        game_service,
        mode,
        is_correct,
        response_time_ms,
        expected_points,
        expected_hearts,
    ):
        """Test scoring matrix for different scenarios."""
        # Create quiz and start session
        quiz = create_quiz(session, n=5)
        game_session = game_service.start_quiz_game(user, quiz.id, mode)

        # Get the first question and its answers
        question_id = game_session.question_ids[0]

        answers = list(
            session.exec(select(Answer).where(Answer.question_id == question_id)).all()
        )

        correct_answer = next((a for a in answers if a.is_correct), None)
        incorrect_answer = next((a for a in answers if not a.is_correct), None)

        assert correct_answer is not None, "No correct answer found"
        assert incorrect_answer is not None, "No incorrect answer found"

        # Select answer based on test parameters
        answer_id = correct_answer.id if is_correct else incorrect_answer.id

        # Set up the time for answer submission
        now_ms = int(datetime.utcnow().timestamp() * 1000)
        answered_at = now_ms - response_time_ms

        # Submit the answer
        result = game_service.submit_answer(
            game_session.id, question_id, answer_id, user, answered_at
        )

        # Unpack result
        (
            actual_is_correct,
            actual_points,
            actual_response_time,
            player_score,
            explanation,
            hearts_left,
            correct_answer_id,
        ) = result

        # Assert results
        assert actual_is_correct == is_correct
        assert actual_points == expected_points
        # First question, score equals points awarded
        assert player_score == expected_points
        assert hearts_left == expected_hearts

    def test_submit_answer_hearts_at_zero(self, session, user, game_service):
        """Test that hearts can't go below zero."""
        quiz = create_quiz(session, n=5)
        game_session = game_service.start_quiz_game(user, quiz.id, GameMode.SOLO)
        question_id = game_session.question_ids[0]

        # Get an incorrect answer ID
        answers = list(
            session.exec(select(Answer).where(Answer.question_id == question_id)).all()
        )

        incorrect_answer = next((a for a in answers if not a.is_correct), None)
        if not incorrect_answer:
            raise ValueError("Could not find incorrect answer")

        now_ms = int(datetime.utcnow().timestamp() * 1000)

        # Submit wrong answer 3 times to reduce hearts to 0
        for _ in range(3):
            game_service.submit_answer(
                game_session.id, question_id, incorrect_answer.id, user, now_ms
            )

        # Submit one more wrong answer
        result = game_service.submit_answer(
            game_session.id, question_id, incorrect_answer.id, user, now_ms
        )

        # Hearts should stay at 0, not go negative
        assert result[5] == 0


class TestCompleteSession:
    """Tests for complete_session method."""

    @freeze_time("2023-01-01 12:00:00")
    def test_complete_session_win(self, session, user, game_service):
        """Test completing a session with hearts remaining (win)."""
        quiz = create_quiz(session, n=5)

        with freeze_time("2023-01-01 12:00:00"):
            game_session = game_service.start_quiz_game(user, quiz.id, GameMode.SOLO)
            question_id = game_session.question_ids[0]

            # Get a correct answer ID
            answers = list(
                session.exec(
                    select(Answer).where(Answer.question_id == question_id)
                ).all()
            )

            correct_answer = next((a for a in answers if a.is_correct), None)
            if not correct_answer:
                raise ValueError("Could not find correct answer")

            now_ms = int(datetime.utcnow().timestamp() * 1000)

            # Answer one question correctly
            game_service.submit_answer(
                game_session.id, question_id, correct_answer.id, user, now_ms
            )

        # Complete session after 30 seconds
        with freeze_time("2023-01-01 12:00:30"):
            result = game_service.complete_session(game_session.id, user)

            assert result["result"] == "win"
            assert result["hearts_remaining"] == 3
            assert result["questions_answered"] == 1
            assert result["correct_answers"] == 1
            assert result["final_score"] == 100
            assert result["total_time_seconds"] == 30

    def test_complete_session_fail(self, session, user, game_service):
        """Test completing a session with no hearts remaining (fail)."""
        quiz = create_quiz(session, n=5)
        game_session = game_service.start_quiz_game(user, quiz.id, GameMode.SOLO)
        question_id = game_session.question_ids[0]

        # Get an incorrect answer ID
        answers = list(
            session.exec(select(Answer).where(Answer.question_id == question_id)).all()
        )

        incorrect_answer = next((a for a in answers if not a.is_correct), None)
        if not incorrect_answer:
            raise ValueError("Could not find incorrect answer")

        now_ms = int(datetime.utcnow().timestamp() * 1000)

        # Submit wrong answer 3 times to reduce hearts to 0
        for _ in range(3):
            game_service.submit_answer(
                game_session.id, question_id, incorrect_answer.id, user, now_ms
            )

        result = game_service.complete_session(game_session.id, user)

        assert result["result"] == "fail"
        assert result["hearts_remaining"] == 0
