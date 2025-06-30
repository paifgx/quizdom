"""Service for admin operations on quizzes and related entities."""

from typing import Any, List, Optional
from datetime import datetime

from sqlmodel import Session, func, select

from app.db.models import Answer, Question, Quiz, QuizQuestion, Topic
from app.schemas.quiz_admin import (
    QuestionCreate,
    QuestionUpdate,
    QuizBatchCreate,
    QuizCreate,
    QuizUpdate,
    TopicCreate,
    TopicUpdate,
)


class QuizAdminService:
    """Service for managing quizzes, questions, and topics."""

    def __init__(self, db: Session):
        self.db = db

    # Topic operations
    def get_topics(self, skip: int = 0, limit: int = 100) -> List[Topic]:
        """Get all topics with pagination."""
        statement = select(Topic).offset(skip).limit(limit)
        return list(self.db.exec(statement).all())

    def get_topic(self, topic_id: int) -> Optional[Topic]:
        """Get a single topic by ID."""
        return self.db.get(Topic, topic_id)

    def create_topic(self, topic_data: TopicCreate) -> Topic:
        """Create a new topic."""
        topic = Topic(**topic_data.dict())
        self.db.add(topic)
        self.db.commit()
        self.db.refresh(topic)
        return topic

    def update_topic(self, topic_id: int, topic_data: TopicUpdate) -> Optional[Topic]:
        """Update an existing topic."""
        topic = self.db.get(Topic, topic_id)
        if not topic:
            return None

        update_data = topic_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(topic, key, value)

        self.db.commit()
        self.db.refresh(topic)
        return topic

    def delete_topic(self, topic_id: int) -> bool:
        """Delete a topic if it has no associated questions or quizzes."""
        topic = self.db.get(Topic, topic_id)
        if not topic:
            return False

        # Check if topic has questions
        statement = (
            select(func.count())
            .select_from(Question)
            .where(Question.topic_id == topic_id)
        )
        question_count = self.db.exec(statement).one()

        # Check if topic has quizzes
        statement = (
            select(func.count()).select_from(Quiz).where(Quiz.topic_id == topic_id)
        )
        quiz_count = self.db.exec(statement).one()

        if question_count > 0 or quiz_count > 0:
            raise ValueError(
                "Thema kann nicht gelöscht werden, da es noch Fragen oder "
                "Quizze enthält"
            )

        self.db.delete(topic)
        self.db.commit()
        return True

    # Question operations
    def get_questions(
        self, skip: int = 0, limit: int = 100, topic_id: Optional[int] = None
    ) -> List[dict[str, Any]]:
        """Get all questions with pagination and optional topic filter."""
        statement = select(Question).offset(skip).limit(limit)

        if topic_id:
            statement = statement.where(Question.topic_id == topic_id)

        questions = list(self.db.exec(statement).all())

        # Create response dictionaries with answers and topic for each question
        question_responses = []
        for question in questions:
            # Load answers
            answers_stmt = select(Answer).where(Answer.question_id == question.id)
            answers = list(self.db.exec(answers_stmt).all())

            # Load topic
            topic = self.db.get(Topic, question.topic_id)

            # Create response dict
            question_dict = {
                "id": question.id,
                "topic_id": question.topic_id,
                "difficulty": question.difficulty,
                "content": question.content,
                "explanation": question.explanation,
                "created_at": question.created_at,
                "answers": answers,
                "topic": topic,
            }
            question_responses.append(question_dict)

        return question_responses

    def get_question(self, question_id: int) -> Optional[dict[str, Any]]:
        """Get a single question by ID with answers and topic."""
        question = self.db.get(Question, question_id)
        if not question:
            return None

        # Load answers
        answers_stmt = select(Answer).where(Answer.question_id == question_id)
        answers = list(self.db.exec(answers_stmt).all())

        # Load topic
        topic = self.db.get(Topic, question.topic_id)

        # Create response dict
        question_dict = {
            "id": question.id,
            "topic_id": question.topic_id,
            "difficulty": question.difficulty,
            "content": question.content,
            "explanation": question.explanation,
            "created_at": question.created_at,
            "answers": answers,
            "topic": topic,
        }

        return question_dict

    def create_question(self, question_data: QuestionCreate) -> dict[str, Any]:
        """Create a new question with answers."""
        # Validate at least one correct answer
        correct_count = sum(1 for answer in question_data.answers if answer.is_correct)
        if correct_count == 0:
            raise ValueError("Mindestens eine Antwort muss als korrekt markiert sein")

        # Create question - convert Difficulty enum to integer
        question_dict = question_data.dict(exclude={"answers"})
        # Convert enum to int
        question_dict["difficulty"] = question_data.difficulty.value
        question = Question(**question_dict)
        self.db.add(question)
        self.db.flush()  # Get the question ID

        # Ensure question ID is available after flush
        if question.id is None:
            raise ValueError("Failed to get question ID after flush")

        # Create answers
        for answer_data in question_data.answers:
            answer = Answer(question_id=question.id, **answer_data.dict())
            self.db.add(answer)

        self.db.commit()
        self.db.refresh(question)

        result = self.get_question(question.id)
        if result is None:
            raise ValueError("Failed to retrieve created question")

        return result

    def update_question(
        self, question_id: int, question_data: QuestionUpdate
    ) -> Optional[dict[str, Any]]:
        """Update an existing question."""
        question = self.db.get(Question, question_id)
        if not question:
            return None

        update_data = question_data.dict(exclude_unset=True)
        # Convert Difficulty enum to integer if present
        if "difficulty" in update_data and update_data["difficulty"] is not None:
            update_data["difficulty"] = update_data["difficulty"].value

        for key, value in update_data.items():
            setattr(question, key, value)

        self.db.commit()
        self.db.refresh(question)
        return self.get_question(question_id)

    def delete_question(self, question_id: int) -> bool:
        """Delete a question and its answers.

        Returns True if successful, False if question not found.
        """
        question = self.db.get(Question, question_id)
        if not question:
            return False

        # Check if question is used in any quizzes
        statement = (
            select(func.count())
            .select_from(QuizQuestion)
            .where(QuizQuestion.question_id == question_id)
        )
        quiz_count = self.db.exec(statement).one()

        if quiz_count > 0:
            raise ValueError(
                "Frage kann nicht gelöscht werden, da sie in Quizzen verwendet wird"
            )

        # Delete answers first (cascade should handle this, but being explicit)
        answer_statement = select(Answer).where(Answer.question_id == question_id)
        answers = self.db.exec(answer_statement).all()
        for answer in answers:
            self.db.delete(answer)

        self.db.delete(question)
        self.db.commit()
        return True

    # Quiz operations
    def get_quizzes(
        self, skip: int = 0, limit: int = 100, topic_id: Optional[int] = None
    ) -> List[dict[str, Any]]:
        """Get all quizzes with pagination and optional topic filter."""
        # Get quizzes with question count
        statement = select(Quiz).offset(skip).limit(limit)

        if topic_id:
            statement = statement.where(Quiz.topic_id == topic_id)

        quizzes = list(self.db.exec(statement).all())

        # Add topic and question count to each quiz
        quiz_responses = []
        for quiz in quizzes:
            # Get question count
            count_stmt = (
                select(func.count())
                .select_from(QuizQuestion)
                .where(QuizQuestion.quiz_id == quiz.id)
            )
            question_count = self.db.exec(count_stmt).one()

            # Get topic
            topic = self.db.get(Topic, quiz.topic_id)

            # Create response dict
            quiz_dict = {
                "id": quiz.id,
                "title": quiz.title,
                "description": quiz.description,
                "topic_id": quiz.topic_id,
                "difficulty": quiz.difficulty,
                "time_limit_minutes": quiz.time_limit_minutes,
                "created_at": quiz.created_at,
                "topic": topic,
                "question_count": question_count,
                "has_image": quiz.image_data is not None,
            }
            quiz_responses.append(quiz_dict)

        return quiz_responses

    def get_quiz(self, quiz_id: int) -> Optional[dict[str, Any]]:
        """Get a single quiz by ID with questions."""
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            return None

        # Get topic
        topic = self.db.get(Topic, quiz.topic_id)

        # Get questions for this quiz
        statement = (
            select(Question)
            .join(QuizQuestion)
            .where(QuizQuestion.quiz_id == quiz_id)
            .order_by("order")
        )
        questions = list(self.db.exec(statement).all())

        # Create response dictionaries for questions with answers and topic
        question_responses = []
        for question in questions:
            # Load answers
            answers_stmt = select(Answer).where(Answer.question_id == question.id)
            answers = list(self.db.exec(answers_stmt).all())

            # Load topic
            question_topic = self.db.get(Topic, question.topic_id)

            # Create question response dict
            question_dict = {
                "id": question.id,
                "topic_id": question.topic_id,
                "difficulty": question.difficulty,
                "content": question.content,
                "explanation": question.explanation,
                "created_at": question.created_at,
                "answers": answers,
                "topic": question_topic,
            }
            question_responses.append(question_dict)

        # Create response dict
        quiz_dict = {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "topic_id": quiz.topic_id,
            "difficulty": quiz.difficulty,
            "time_limit_minutes": quiz.time_limit_minutes,
            "created_at": quiz.created_at,
            "topic": topic,
            "questions": question_responses,
            "question_count": len(question_responses),
            "has_image": quiz.image_data is not None,
        }

        return quiz_dict

    def create_quiz(self, quiz_data: QuizCreate) -> dict[str, Any]:
        """Create a new quiz with questions (or empty for preparation)."""
        for qid in quiz_data.question_ids:
            if not self.db.get(Question, qid):
                raise ValueError(f"Frage mit ID {qid} existiert nicht")

        # Create quiz - convert Difficulty enum to integer
        quiz_dict = quiz_data.dict(exclude={"question_ids"})
        # Convert enum to int
        quiz_dict["difficulty"] = quiz_data.difficulty.value
        quiz = Quiz(**quiz_dict)
        self.db.add(quiz)
        self.db.flush()

        # Ensure quiz ID is available after flush
        if quiz.id is None:
            raise ValueError("Failed to get quiz ID after flush")

        for order, question_id in enumerate(quiz_data.question_ids):
            quiz_question = QuizQuestion(
                quiz_id=quiz.id, question_id=question_id, order=order
            )
            self.db.add(quiz_question)

        self.db.commit()
        self.db.refresh(quiz)

        result = self.get_quiz(quiz.id)
        if result is None:
            raise ValueError("Failed to retrieve created quiz")

        return result

    def update_quiz(
        self, quiz_id: int, quiz_data: QuizUpdate
    ) -> Optional[dict[str, Any]]:
        """Update an existing quiz."""
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            return None

        update_data = quiz_data.dict(exclude_unset=True, exclude={"question_ids"})
        for key, value in update_data.items():
            setattr(quiz, key, value)

        # Update questions if provided
        if quiz_data.question_ids is not None:
            # Verify all question IDs exist
            for qid in quiz_data.question_ids:
                if not self.db.get(Question, qid):
                    raise ValueError(f"Frage mit ID {qid} existiert nicht")

            # Delete existing quiz-question relationships
            statement = select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id)
            existing_relations = self.db.exec(statement).all()
            for relation in existing_relations:
                self.db.delete(relation)

            # Create new relationships
            for order, question_id in enumerate(quiz_data.question_ids):
                quiz_question = QuizQuestion(
                    quiz_id=quiz_id, question_id=question_id, order=order
                )
                self.db.add(quiz_question)

        self.db.commit()
        self.db.refresh(quiz)
        return self.get_quiz(quiz_id)

    def delete_quiz(self, quiz_id: int) -> bool:
        """Delete a quiz and its question relationships."""
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            return False

        # Delete quiz-question relationships
        statement = select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id)
        relations = self.db.exec(statement).all()
        for relation in relations:
            self.db.delete(relation)

        self.db.delete(quiz)
        self.db.commit()
        return True

    def create_quiz_batch(self, quiz_data: QuizBatchCreate) -> dict[str, Any]:
        """Create a new quiz with questions in a single batch operation."""
        quiz_dict = quiz_data.dict(exclude={"questions"})
        quiz_dict["difficulty"] = quiz_data.difficulty.value
        quiz = Quiz(**quiz_dict)
        self.db.add(quiz)
        self.db.flush()  # Get the quiz ID

        if quiz.id is None:
            raise ValueError("Failed to create quiz")

        created_question_ids = []

        # Process each question (either create new or use existing)
        for order, question_item in enumerate(quiz_data.questions):
            if isinstance(question_item, int):
                # Existing question ID - verify it exists
                if not self.db.get(Question, question_item):
                    raise ValueError(f"Frage mit ID {question_item} existiert nicht")
                question_id: int = question_item
            else:
                question_create = question_item

                if not self.db.get(Topic, question_create.topic_id):
                    raise ValueError(
                        f"Thema mit ID {question_create.topic_id} existiert nicht"
                    )

                question_dict = question_create.dict(exclude={"answers"})
                # Convert enum to int for question difficulty too
                question_dict["difficulty"] = question_create.difficulty.value
                question = Question(**question_dict)
                self.db.add(question)
                self.db.flush()

                if question.id is None:
                    raise ValueError("Failed to create question")

                # Create answers
                for answer_data in question_create.answers:
                    answer = Answer(question_id=question.id, **answer_data.dict())
                    self.db.add(answer)

                question_id = question.id

            created_question_ids.append(question_id)

            # Create quiz-question relationship
            quiz_question = QuizQuestion(
                quiz_id=quiz.id, question_id=question_id, order=order
            )
            self.db.add(quiz_question)

        self.db.commit()
        self.db.refresh(quiz)

        result = self.get_quiz(quiz.id)
        if result is None:
            raise ValueError("Failed to retrieve created quiz")

        return result

    # Image operations
    def upload_quiz_image(self, quiz_id: int, image_data: bytes, filename: str) -> None:
        """Upload an image for a quiz."""
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            raise ValueError("Quiz nicht gefunden")

        quiz.image_data = image_data
        quiz.image_filename = filename
        self.db.commit()
        self.db.refresh(quiz)

    def get_quiz_image(self, quiz_id: int) -> tuple[Optional[bytes], Optional[str]]:
        """Get the image for a quiz."""
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            return None, None

        return quiz.image_data, quiz.image_filename

    def delete_quiz_image(self, quiz_id: int) -> bool:
        """Delete the image for a quiz."""
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            return False

        quiz.image_data = None
        quiz.image_filename = None
        self.db.commit()
        self.db.refresh(quiz)
        return True

    # Publishing operations
    def publish_quiz(self, quiz_id: int) -> Optional[dict[str, Any]]:
        """Publish a quiz for gameplay."""
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            return None

        # Check if quiz has questions
        statement = (
            select(func.count())
            .select_from(QuizQuestion)
            .where(QuizQuestion.quiz_id == quiz_id)
        )
        question_count = self.db.exec(statement).one()

        if question_count == 0:
            raise ValueError("Quiz muss mindestens eine Frage enthalten")

        from app.db.models import QuizStatus

        quiz.status = QuizStatus.PUBLISHED
        quiz.published_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(quiz)
        return self.get_quiz(quiz_id)

    def archive_quiz(self, quiz_id: int) -> Optional[dict[str, Any]]:
        """Archive a quiz to hide it from gameplay."""
        quiz = self.db.get(Quiz, quiz_id)
        if not quiz:
            return None

        from app.db.models import QuizStatus

        quiz.status = QuizStatus.ARCHIVED

        self.db.commit()
        self.db.refresh(quiz)
        return self.get_quiz(quiz_id)

    def get_published_quizzes(
        self, skip: int = 0, limit: int = 100, topic_id: Optional[int] = None
    ) -> List[dict[str, Any]]:
        """Get only published quizzes."""
        from app.db.models import QuizStatus

        statement = (
            select(Quiz)
            .where(Quiz.status == QuizStatus.PUBLISHED)
            .offset(skip)
            .limit(limit)
        )

        if topic_id:
            statement = statement.where(Quiz.topic_id == topic_id)

        quizzes = list(self.db.exec(statement).all())

        # Add topic and question count as before
        quiz_responses = []
        for quiz in quizzes:
            count_stmt = (
                select(func.count())
                .select_from(QuizQuestion)
                .where(QuizQuestion.quiz_id == quiz.id)
            )
            question_count = self.db.exec(count_stmt).one()

            topic = self.db.get(Topic, quiz.topic_id)

            quiz_dict = {
                "id": quiz.id,
                "title": quiz.title,
                "description": quiz.description,
                "topic_id": quiz.topic_id,
                "difficulty": quiz.difficulty,
                "time_limit_minutes": quiz.time_limit_minutes,
                "status": quiz.status,
                "published_at": quiz.published_at,
                "play_count": quiz.play_count,
                "created_at": quiz.created_at,
                "topic": topic,
                "question_count": question_count,
                "has_image": quiz.image_data is not None,
            }
            quiz_responses.append(quiz_dict)

        return quiz_responses
