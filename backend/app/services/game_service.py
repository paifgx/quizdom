"""
Game service for managing quiz sessions.

This module handles game session creation, tracking answers, and scoring.
"""

from datetime import datetime
from typing import List, Optional, Tuple, Union

from sqlmodel import Session, select
from random import sample

from app.db.models import (
    Answer,
    GameSession,
    GameStatus,
    GameMode,
    PlayerAnswer,
    Question,
    Quiz,
    QuizQuestion,
    QuizStatus,
    SessionPlayers,
    User,
)


class GameService:
    """Service for game session management."""

    def __init__(self, db: Session):
        self.db = db

    def start_quiz_game(
        self,
        user: User,
        quiz_id: int,
        mode: Union[str, GameMode]
    ) -> GameSession:
        """Start a game session with a curated quiz."""
        # Verify quiz exists and is published
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            raise ValueError("Quiz nicht gefunden")

        if quiz.status != QuizStatus.PUBLISHED:
            raise ValueError("Quiz ist nicht veröffentlicht")

        # Get questions for this quiz in order
        stmt = (
            select(Question)
            .join(QuizQuestion)
            .where(QuizQuestion.quiz_id == quiz_id)
            .order_by("order")
        )
        questions = list(self.db.exec(stmt).all())

        if not questions:
            raise ValueError("Quiz enthält keine Fragen")

        # Convert string mode to enum if needed
        game_mode = GameMode(mode.lower()) if isinstance(mode, str) else mode

        # Create game session
        session = GameSession(
            mode=game_mode,
            status=GameStatus.ACTIVE,
            quiz_id=quiz_id,
            question_ids=[q.id for q in questions if q.id is not None],
            started_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db.add(session)
        self.db.flush()

        # Ensure session ID is available after flush
        if session.id is None:
            raise ValueError("Session ID nicht verfügbar")

        # Ensure user ID is available
        if user.id is None:
            raise ValueError("User ID nicht verfügbar")

        # Add player to session
        if session.id is not None:  # Type guard to make user_id non-None for SessionPlayers
            session_player = SessionPlayers(
                session_id=session.id,
                user_id=user.id,
                hearts_left=3,
                score=0,
            )
            self.db.add(session_player)

        # Increment quiz play count
        quiz.play_count += 1

        self.db.commit()
        self.db.refresh(session)

        return session

    def start_topic_game(
        self,
        user: User,
        topic_id: int,
        mode: Union[str, GameMode],
        question_count: int = 10,
        difficulty_min: Optional[int] = None,
        difficulty_max: Optional[int] = None
    ) -> GameSession:
        """Start a game session with random questions from a topic."""
        # Get topic
        from app.db.models import Topic
        topic = self.db.get(Topic, topic_id)
        if not topic:
            raise ValueError("Thema nicht gefunden")

        # Get random questions from topic
        stmt = select(Question).where(Question.topic_id == topic_id)

        # Apply difficulty filter if specified
        if difficulty_min is not None:
            stmt = stmt.where(Question.difficulty >= difficulty_min)
        if difficulty_max is not None:
            stmt = stmt.where(Question.difficulty <= difficulty_max)

        all_questions = list(self.db.exec(stmt).all())

        if not all_questions:
            raise ValueError("Keine Fragen für dieses Thema verfügbar")

        # Select random subset
        question_count = min(question_count, len(all_questions))
        questions = sample(all_questions, question_count)

        # Convert string mode to enum if needed - ensure lowercase to match database enum values
        game_mode = GameMode(mode.lower()) if isinstance(mode, str) else mode

        # Create game session
        session = GameSession(
            mode=game_mode,
            status=GameStatus.ACTIVE,
            topic_id=topic_id,
            question_ids=[q.id for q in questions if q.id is not None],
            current_question_index=0,
            started_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db.add(session)
        self.db.flush()

        # Ensure session ID is available after flush
        if session.id is None:
            raise ValueError("Session ID nicht verfügbar")

        # Add player to session
        session_player = SessionPlayers(
            session_id=session.id,
            user_id=user.id,
            hearts_left=3,
            score=0,
        )
        self.db.add(session_player)

        self.db.commit()
        self.db.refresh(session)

        return session

    def get_question(
        self,
        session_id: int,
        question_index: int,
        user: User
    ) -> Tuple[Question, List[Answer]]:
        """Get a specific question from the game session."""
        # Verify session exists and user is participant
        session = self.db.get(GameSession, session_id)
        if not session:
            raise ValueError("Session nicht gefunden")

        # Check if user is in session
        stmt = (
            select(SessionPlayers)
            .where(SessionPlayers.session_id == session_id)
            .where(SessionPlayers.user_id == user.id)
        )
        player = self.db.exec(stmt).first()
        if not player:
            raise ValueError("Nicht Teil dieser Session")

        # Check if question index is valid
        if not session.question_ids or question_index >= len(session.question_ids):
            raise ValueError("Frage nicht gefunden")

        # Get the question
        question_id = session.question_ids[question_index]
        question = self.db.get(Question, question_id)
        if not question:
            raise ValueError("Frage nicht gefunden")

        # Get answers for the question
        stmt = select(Answer).where(Answer.question_id == question_id)
        answers = list(self.db.exec(stmt).all())

        # Update session's current question index
        session.current_question_index = question_index
        session.updated_at = datetime.utcnow()
        self.db.commit()

        return question, answers

    def submit_answer(
        self,
        session_id: int,
        question_id: int,
        answer_id: int,
        user: User,
        answered_at: int
    ) -> Tuple[bool, int, int, int, Optional[str]]:
        """
        Submit answer for a question.

        Returns: (is_correct, points_earned, response_time_ms, player_score, explanation)
        """
        # Verify session and player
        session = self.db.get(GameSession, session_id)
        if not session:
            raise ValueError("Session nicht gefunden")

        stmt = (
            select(SessionPlayers)
            .where(SessionPlayers.session_id == session_id)
            .where(SessionPlayers.user_id == user.id)
        )
        player = self.db.exec(stmt).first()
        if not player:
            raise ValueError("Nicht Teil dieser Session")

        # Get the answer and check if it's correct
        answer = self.db.get(Answer, answer_id)
        if not answer or answer.question_id != question_id:
            raise ValueError("Ungültige Antwort")

        # Get the question
        question = self.db.get(Question, question_id)
        if not question:
            raise ValueError("Frage nicht gefunden")

        # Calculate points based on response time
        if session.updated_at is None:
            raise ValueError("Session timestamp nicht verfügbar")

        response_time_ms = answered_at - \
            int(session.updated_at.timestamp() * 1000)
        base_points = 100
        time_bonus = max(0, 100 - (response_time_ms // 300)
                         )  # Lose 1 point per 300ms
        points_earned = (base_points + time_bonus) if answer.is_correct else 0

        # Update player state
        if answer.is_correct:
            player.score += points_earned
        else:
            player.hearts_left = max(0, player.hearts_left - 1)

        # Save player answer
        player_answer = PlayerAnswer(
            session_id=session_id,
            question_id=question_id,
            selected_answer_id=answer_id,
            is_correct=answer.is_correct,
            points_awarded=points_earned,
            answer_time_ms=response_time_ms,
        )
        self.db.add(player_answer)
        self.db.commit()
        self.db.refresh(player)

        # Get correct answer ID
        correct_answer_stmt = (
            select(Answer)
            .where(Answer.question_id == question_id)
            .where(Answer.is_correct)
        )
        correct_answer = self.db.exec(correct_answer_stmt).first()

        return (
            answer.is_correct,
            points_earned,
            response_time_ms,
            player.score,
            question.explanation
        )

    def complete_session(
        self,
        session_id: int,
        user: User
    ) -> dict:
        """Complete a game session and get results."""
        # Verify session and player
        session = self.db.get(GameSession, session_id)
        if not session:
            raise ValueError("Session nicht gefunden")

        stmt = (
            select(SessionPlayers)
            .where(SessionPlayers.session_id == session_id)
            .where(SessionPlayers.user_id == user.id)
        )
        player = self.db.exec(stmt).first()
        if not player:
            raise ValueError("Nicht Teil dieser Session")

        # Update session status
        session.status = GameStatus.FINISHED
        session.ended_at = datetime.utcnow()

        # Calculate statistics
        stmt = select(PlayerAnswer).where(
            PlayerAnswer.session_id == session_id)
        player_answers = list(self.db.exec(stmt).all())

        questions_answered = len(player_answers)
        correct_answers = sum(1 for a in player_answers if a.is_correct)
        total_time_seconds = int(
            (session.ended_at - session.started_at).total_seconds()
        )

        # Determine result
        result = "win" if player.hearts_left > 0 else "fail"

        self.db.commit()

        return {
            "session_id": session.id,
            "mode": session.mode,
            "result": result,
            "final_score": player.score,
            "hearts_remaining": player.hearts_left,
            "questions_answered": questions_answered,
            "correct_answers": correct_answers,
            "total_time_seconds": total_time_seconds,
        }
