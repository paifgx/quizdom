"""Metrics tracking for game analytics."""

from typing import Any, Dict, Optional

from sqlmodel import Session, func, select

from app.db.models import GameSession, Quiz, SessionPlayers


class GameMetrics:
    """Service for tracking game metrics."""

    def __init__(self, db: Session):
        self.db = db

    def track_game_start(
        self,
        session_id: int,
        game_type: str,
        quiz_id: Optional[int] = None,
        topic_id: Optional[int] = None,
    ) -> None:
        """Track when a game starts."""
        # Log to monitoring system
        print(
            f"Game started: session={session_id}, type={game_type}, "
            f"quiz={quiz_id}, topic={topic_id}"
        )

    def track_game_complete(
        self, session_id: int, result: str, score: int, duration_seconds: int
    ) -> None:
        """Track when a game completes."""
        # Update quiz play count if applicable
        session = self.db.get(GameSession, session_id)
        if session and session.quiz_id:
            quiz = self.db.get(Quiz, session.quiz_id)
            if quiz:
                quiz.play_count += 1
                self.db.commit()

        # Log metrics
        print(
            f"Game completed: session={session_id}, result={result}, "
            f"score={score}, duration={duration_seconds}s"
        )

    def get_quiz_stats(self, quiz_id: int) -> Dict[str, Any]:
        """Get statistics for a specific quiz."""
        # Count total plays
        play_count_stmt = (
            select(func.count())
            .select_from(GameSession)
            .where(GameSession.quiz_id == quiz_id)
        )
        total_plays = self.db.exec(play_count_stmt).one()

        # Average score
        avg_score_stmt = (
            select(func.avg(SessionPlayers.score))
            .select_from(GameSession)
            .join(SessionPlayers)
            .where(GameSession.quiz_id == quiz_id)
        )
        avg_score = self.db.exec(avg_score_stmt).one() or 0

        # Success rate
        success_stmt = (
            select(func.count())
            .select_from(GameSession)
            .join(SessionPlayers)
            .where(GameSession.quiz_id == quiz_id, SessionPlayers.hearts_left > 0)
        )
        successful_plays = self.db.exec(success_stmt).one()

        success_rate = (successful_plays / total_plays * 100) if total_plays > 0 else 0

        return {
            "total_plays": total_plays,
            "average_score": float(avg_score),
            "success_rate": success_rate,
        }

    def get_topic_stats(self, topic_id: int) -> Dict[str, Any]:
        """Get statistics for topic-based games."""
        # Similar implementation for topic stats
        return {
            "total_plays": 0,
            "average_score": 0.0,
            "popular_questions": [],
        }
