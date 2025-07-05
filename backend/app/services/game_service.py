"""
Game service for managing quiz sessions.

This module provides a service layer for game-related functionality:
- Starting game sessions with both curated quizzes and random topics
- Retrieving questions and answers
- Processing user answers and scoring
- Game session completion and statistics
"""

from datetime import datetime
from random import sample
from typing import Any, Dict, List, Optional, Tuple, Union

from sqlmodel import Session, select

from app.db.models import (
    Answer,
    GameMode,
    GameSession,
    GameStatus,
    PlayerAnswer,
    Question,
    Quiz,
    QuizQuestion,
    QuizStatus,
    SessionPlayers,
    Topic,
    User,
)


class GameService:
    """Service for game session management.

    This service encapsulates all game-related business logic, handling game session
    creation, question retrieval, answer processing, and game completion. It serves
    as an abstraction layer between the API routers and the database models.

    The service enforces game rules such as:
    - Player participation validation
    - Question accessibility and sequencing
    - Score calculation based on response time
    - Hearts/lives management for incorrect answers
    - Game completion and statistics calculation
    """

    def __init__(self, db: Session):
        """Initialize with database session.

        Args:
            db: SQLModel database session for database operations
        """
        self.db = db

    def get_quizzes_by_topic(self, topic_id: Optional[int] = None) -> List[Quiz]:
        """Get published quizzes, optionally filtered by topic.

        Retrieves only quizzes with PUBLISHED status that users can play.
        When a topic_id is provided, filters quizzes to only those for that topic.

        Args:
            topic_id: Optional topic filter to narrow down quiz selection

        Returns:
            List of published quizzes matching the criteria
        """
        query = select(Quiz).where(Quiz.status == QuizStatus.PUBLISHED)
        if topic_id is not None:
            query = query.where(Quiz.topic_id == topic_id)

        return list(self.db.exec(query).all())

    def start_quiz_game(
        self, user: User, quiz_id: int, mode: Union[str, GameMode]
    ) -> GameSession:
        """Start a game session with a curated quiz.

        Creates a new game session for the specified quiz and user. The game session
        includes all questions from the quiz in the order defined in the quiz.
        The session is initialized with:
        - ACTIVE status
        - Current question index set to 0 (first question)
        - Start and updated timestamps
        - Player added with 3 hearts and 0 score

        The quiz play count is incremented to track popularity.

        Args:
            user: User starting the game session
            quiz_id: ID of the quiz to play
            mode: Game mode (solo, comp, collab) affecting game mechanics

        Returns:
            Created GameSession with initialized state

        Raises:
            ValueError: When quiz doesn't exist, isn't published, or has no questions
        """
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

        # Ensure mode is lowercase as the database enum expects lowercase values
        if isinstance(mode, str):
            mode_str = mode.lower()
            game_mode = GameMode(mode_str)

        # Create game session
        session = GameSession(
            mode=game_mode,
            status=GameStatus.ACTIVE,
            quiz_id=quiz_id,
            question_ids=[q.id for q in questions if q.id is not None],
            current_question_index=0,
            started_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
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
        difficulty_max: Optional[int] = None,
    ) -> GameSession:
        """Start a game session with random questions from a topic.

        Creates a new game session with randomly selected questions from the specified topic.
        Questions are filtered by difficulty if min/max parameters are provided.
        The session is initialized with:
        - ACTIVE status
        - Current question index set to 0 (first question)
        - Start and updated timestamps
        - Player added with 3 hearts and 0 score

        This differs from quiz games in that questions are randomly selected rather than
        curated by a quiz creator, allowing for variety in repeated play.

        Args:
            user: User starting the game session
            topic_id: ID of the topic to select questions from
            mode: Game mode (solo, comp, collab) affecting game mechanics
            question_count: Number of questions to include (5-50)
            difficulty_min: Minimum difficulty level (1-5)
            difficulty_max: Maximum difficulty level (1-5)

        Returns:
            Created GameSession with initialized state

        Raises:
            ValueError: When topic doesn't exist or has no matching questions within the difficulty range
        """
        # Get topic
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

        # Convert string mode to enum if needed
        if isinstance(mode, str):
            # Ensure mode is lowercase as the database enum expects lowercase values
            mode_str = mode.lower()
            game_mode = GameMode(mode_str)
        else:
            game_mode = mode

        # Create game session
        session = GameSession(
            mode=game_mode,
            status=GameStatus.ACTIVE,
            topic_id=topic_id,
            question_ids=[q.id for q in questions if q.id is not None],
            current_question_index=0,
            started_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self.db.add(session)
        self.db.flush()

        # Ensure session ID is available after flush
        if session.id is None:
            raise ValueError("Session ID nicht verfügbar")

        # Add player to session
        if user.id is None:
            raise ValueError("User ID nicht verfügbar")

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

    def join_session(
        self, session_id: int, user: User
    ) -> Tuple[GameSession, List[SessionPlayers]]:
        """Join an existing game session.

        Allows a user to join an existing multiplayer game session.
        This method:
        - Verifies the session exists and is active
        - Checks if the user is already in the session
        - Adds the user as a new player if the session allows it
        - Returns session details and all players

        For multiplayer games (competitive/collaborative), multiple players can join
        until the game starts or reaches capacity.

        Args:
            session_id: ID of the game session to join
            user: User attempting to join

        Returns:
            Tuple of (GameSession, list of all SessionPlayers)

        Raises:
            ValueError: When session doesn't exist, is not active, user already joined,
                       or session is full
        """
        # Verify session exists
        session = self.db.get(GameSession, session_id)
        if not session:
            raise ValueError("Spielsitzung nicht gefunden")

        # Check if session is active
        if session.status != GameStatus.ACTIVE:
            raise ValueError("Spielsitzung ist nicht mehr aktiv")

        # Check if user is already in session
        existing_player = self.db.exec(
            select(SessionPlayers)
            .where(SessionPlayers.session_id == session_id)
            .where(SessionPlayers.user_id == user.id)
        ).first()

        if existing_player:
            # User already in session, just return current state
            all_players = list(
                self.db.exec(
                    select(SessionPlayers).where(
                        SessionPlayers.session_id == session_id
                    )
                ).all()
            )
            return session, all_players

        # Check if session allows more players
        current_players = list(
            self.db.exec(
                select(SessionPlayers).where(
                    SessionPlayers.session_id == session_id)
            ).all()
        )

        # For solo mode, only one player allowed
        if session.mode == GameMode.SOLO and len(current_players) >= 1:
            raise ValueError("Solo-Spiele erlauben nur einen Spieler")

        # For competitive and collaborative, limit to 2 players for now
        if (
            session.mode in [GameMode.COMP, GameMode.COLLAB]
            and len(current_players) >= 2
        ):
            raise ValueError("Dieses Spiel ist bereits voll")

        # Add user to session
        if user.id is None:
            raise ValueError("User ID nicht verfügbar")

        new_player = SessionPlayers(
            session_id=session_id,
            user_id=user.id,
            hearts_left=3,
            score=0,
        )
        self.db.add(new_player)
        self.db.commit()

        # Get all players including the new one
        all_players = list(
            self.db.exec(
                select(SessionPlayers).where(
                    SessionPlayers.session_id == session_id)
            ).all()
        )

        return session, all_players

    def get_question(
        self, session_id: int, question_index: int, user: User
    ) -> Tuple[Question, List[Answer], int]:
        """Get a specific question from the game session.

        Retrieves the question at the specified index from the game session.
        This method enforces security by verifying:
        - The session exists
        - The user is a participant in the session
        - The question index is valid for the session

        The session's current_question_index is updated to track progress,
        and the session timestamp is updated to monitor activity.

        A time limit is calculated for the question:
        - For quiz-based games, the time limit is determined from the quiz settings
        - For topic-based games, a default 30-second limit is used

        Args:
            session_id: ID of the game session
            question_index: Index of the question to retrieve (0-based)
            user: User requesting the question

        Returns:
            Tuple of (Question object, list of Answer objects, time limit in seconds)

        Raises:
            ValueError: When session doesn't exist, user is not participant, or question index is invalid
        """
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
            raise ValueError("Nicht Teil dieser Spielsitzung")

        # Check if question index is valid
        if not session.question_ids or question_index >= len(session.question_ids):
            raise ValueError(
                f"Frage nicht gefunden. Index muss zwischen 0 und {len(session.question_ids) - 1 if session.question_ids else 0} liegen"
            )

        # Get the question
        question_id = session.question_ids[question_index]
        question = self.db.get(Question, question_id)
        if not question:
            raise ValueError("Frage nicht gefunden")

        # Get answers for the question
        answers = self.db.exec(
            select(Answer).where(Answer.question_id == question.id)
        ).all()

        # Update session timestamp and current question index
        session.updated_at = datetime.utcnow()
        session.current_question_index = question_index
        self.db.commit()

        # Calculate time limit
        time_limit = 30  # Default time limit in seconds
        if session.quiz_id is not None:
            quiz = self.db.get(Quiz, session.quiz_id)
            if quiz and quiz.time_limit_minutes:
                time_limit = quiz.time_limit_minutes * \
                    60 // len(session.question_ids)

        return question, list(answers), time_limit

    def submit_answer(
        self,
        session_id: int,
        question_id: int,
        answer_id: int,
        user: User,
        answered_at: int,
    ) -> Tuple[bool, int, int, int, Optional[str], int, int]:
        """Submit an answer for a question in a game session.

        Processes a player's answer to a question, handling:
        - Validation of session, user participation, question, and answer
        - Correctness checking against the correct answer
        - Response time calculation
        - Point calculation based on correctness and response time
        - Player score updating
        - Hearts/lives management for incorrect answers (except in collaborative mode)
        - Recording the answer in the database

        The scoring system rewards faster correct answers:
        - 0-3 seconds: 100 points
        - 3-6 seconds: 50 points
        - >6 seconds: 25 points

        Incorrect answers result in:
        - No points gained
        - Loss of one heart/life (except in collaborative mode)

        Args:
            session_id: ID of the game session
            question_id: ID of the question being answered
            answer_id: ID of the selected answer
            user: User submitting the answer
            answered_at: Timestamp when answer was submitted (milliseconds)

        Returns:
            Tuple of (is_correct, points_earned, response_time_ms, player_score,
                     explanation, player_hearts, correct_answer_id)

        Raises:
            ValueError: When session doesn't exist, user is not participant,
                       question is invalid for the session, or answer is invalid for the question
        """
        # Verify session exists
        session = self.db.get(GameSession, session_id)
        if not session:
            raise ValueError("Spielsitzung nicht gefunden")

        # Check if user is in session
        stmt = (
            select(SessionPlayers)
            .where(SessionPlayers.session_id == session_id)
            .where(SessionPlayers.user_id == user.id)
        )
        player = self.db.exec(stmt).first()
        if not player:
            raise ValueError("Nicht Teil dieser Spielsitzung")

        # Get the question and check if it's valid
        question = self.db.get(Question, question_id)
        if not question or (
            session.question_ids and question_id not in session.question_ids
        ):
            raise ValueError("Ungültige Frage für diese Spielsitzung")

        # Get the selected answer
        selected_answer = self.db.get(Answer, answer_id)
        if not selected_answer or selected_answer.question_id != question.id:
            raise ValueError("Ungültige Antwort für diese Frage")

        # Get the correct answer
        correct_answer = self.db.exec(
            select(Answer)
            .where(Answer.question_id == question.id)
            .where(Answer.is_correct)
        ).first()

        if not correct_answer:
            raise ValueError("Keine korrekte Antwort für diese Frage gefunden")

        # Ensure correct_answer.id is not None
        if correct_answer.id is None:
            raise ValueError("Antwort ID ist nicht verfügbar")

        # Check if answer is correct
        is_correct = selected_answer.id == correct_answer.id

        # Calculate response time
        current_time = int(datetime.utcnow().timestamp() * 1000)
        response_time_ms = current_time - answered_at

        # Calculate points based on response time
        points_earned = 0
        if is_correct:
            if response_time_ms <= 3000:  # 0-3 seconds
                points_earned = 100
            elif response_time_ms <= 6000:  # 3-6 seconds
                points_earned = 50
            else:  # > 6 seconds
                points_earned = 25

        # Update player score
        player.score += points_earned

        # Update hearts if answer was wrong
        if not is_correct and session.mode != GameMode.COLLAB:
            player.hearts_left = max(0, player.hearts_left - 1)

        # Ensure IDs are available
        if question.id is None:
            raise ValueError("Question ID nicht verfügbar")

        if selected_answer.id is None:
            raise ValueError("Answer ID nicht verfügbar")

        # Record the answer
        player_answer = PlayerAnswer(
            session_id=session_id,
            question_id=question.id,
            selected_answer_id=selected_answer.id,
            is_correct=is_correct,
            points_awarded=points_earned,
            answer_time_ms=response_time_ms,
            answered_at=datetime.utcnow(),
        )
        self.db.add(player_answer)

        # Update session timestamp
        session.updated_at = datetime.utcnow()
        self.db.commit()

        return (
            is_correct,
            points_earned,
            response_time_ms,
            player.score,
            question.explanation,
            player.hearts_left,
            correct_answer.id,
        )

    def complete_session(self, session_id: int, user: User) -> Dict[str, Any]:
        """Complete a game session and get results.

        Finalizes a game session, calculating statistics and setting the status to FINISHED.
        This method:
        - Verifies session exists and user is a participant
        - Marks the session as finished with an end timestamp
        - Calculates final statistics:
          - Questions answered and correct answer count
          - Total time spent
          - Final score and hearts remaining
          - Result (win/fail) based on hearts

        Future enhancements:
        - The rank and percentile are placeholders and will be implemented
          with proper leaderboard calculations in the future

        Args:
            session_id: ID of the game session to complete
            user: User completing the session

        Returns:
            Dictionary with game result statistics:
            - session_id: The completed session ID
            - mode: Game mode used
            - result: "win" or "fail" based on hearts remaining
            - final_score: Player's final score
            - hearts_remaining: Hearts/lives remaining
            - questions_answered: Total number of questions answered
            - correct_answers: Number of correctly answered questions
            - total_time_seconds: Total session duration in seconds
            - rank: Placeholder for future leaderboard rank
            - percentile: Placeholder for future percentile ranking

        Raises:
            ValueError: When session doesn't exist or user is not a participant
        """
        # Verify session exists
        session = self.db.get(GameSession, session_id)
        if not session:
            raise ValueError("Spielsitzung nicht gefunden")

        # Check if user is in session
        stmt = (
            select(SessionPlayers)
            .where(SessionPlayers.session_id == session_id)
            .where(SessionPlayers.user_id == user.id)
        )
        player = self.db.exec(stmt).first()
        if not player:
            raise ValueError("Nicht Teil dieser Spielsitzung")

        # Mark session as finished
        session.status = GameStatus.FINISHED
        session.ended_at = datetime.utcnow()

        # Calculate session statistics
        player_answers = self.db.exec(
            select(PlayerAnswer).where(PlayerAnswer.session_id == session_id)
        ).all()

        questions_answered = len(player_answers)
        correct_answers = sum(
            1 for answer in player_answers if answer.is_correct)

        # Calculate total time in seconds
        total_time_seconds = 0
        if session.started_at and session.ended_at:
            total_time_seconds = int(
                (session.ended_at - session.started_at).total_seconds()
            )

        # Determine result (win/fail)
        result = "win"
        if player.hearts_left <= 0:
            result = "fail"

        # TODO: Calculate rank and percentile
        rank = 1
        percentile = 100

        self.db.commit()

        return {
            "session_id": session_id,
            "mode": session.mode,
            "result": result,
            "final_score": player.score,
            "hearts_remaining": player.hearts_left,
            "questions_answered": questions_answered,
            "correct_answers": correct_answers,
            "total_time_seconds": total_time_seconds,
            "rank": rank,
            "percentile": percentile,
        }

    # ---------------------------------------------------------------------
    # Compatibility helpers
    # ---------------------------------------------------------------------

    def get_question_data(
        self, session_id: int, question_index: int, user: User
    ) -> dict[str, Any]:
        """Return question data structure expected by WebSocket router.

        This is a compatibility shim for the WebSocket router that expects
        a *question* event payload. It returns the question content, possible
        answers and basic metadata.

        NOTE: The implementation focuses only on the data required for
        real-time latency tests (ping/pong) and therefore keeps the payload
        minimal. Extend as soon as the frontend relies on richer data.
        """
        # Fetch question and answers using existing helper
        question, answers, _time_limit = self.get_question(
            session_id=session_id, question_index=question_index, user=user
        )

        return {
            "id": question.id,
            "content": question.content,
            "answers": [
                {
                    "id": a.id,
                    "content": a.content,
                }
                for a in answers
            ],
            "index": question_index,
        }
