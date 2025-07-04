"""Test factories for database models."""

import random

import factory
from faker import Faker
from sqlmodel import SQLModel

from app.db.models import Answer, Question, Quiz, QuizQuestion, QuizStatus, Topic

faker = Faker("de_DE")


class SQLModelFactory(factory.Factory):
    """Base factory for SQLModel models."""

    class Meta:
        model = SQLModel

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Create, but don't save the model instance."""
        return model_class(*args, **kwargs)


class TopicFactory(SQLModelFactory):
    """Factory for Topic model."""

    class Meta:
        model = Topic

    title = factory.Sequence(lambda n: f"{faker.word().capitalize()}-{n}")
    description = factory.LazyAttribute(lambda _: faker.text(max_nb_chars=50))


class QuestionFactory(SQLModelFactory):
    """Factory for Question model."""

    class Meta:
        model = Question

    topic_id = factory.SubFactory(TopicFactory)
    difficulty = factory.LazyFunction(lambda: random.randint(1, 3))
    content = factory.LazyAttribute(lambda _: faker.sentence())


class AnswerFactory(SQLModelFactory):
    """Factory for Answer model."""

    class Meta:
        model = Answer

    question_id = factory.SubFactory(QuestionFactory)
    content = factory.LazyAttribute(lambda _: faker.word())
    is_correct = False


class QuizFactory(SQLModelFactory):
    """Factory for Quiz model."""

    class Meta:
        model = Quiz

    title = factory.Sequence(lambda n: f"Quiz-{n}")
    description = factory.LazyAttribute(lambda _: faker.text(max_nb_chars=50))
    status = QuizStatus.PUBLISHED
    is_public = True
    difficulty = factory.LazyFunction(lambda: random.randint(1, 3))
    time_limit = 30
    hearts = 3


def create_quiz(session, *, n=5):
    """Create a test quiz with questions and answers.

    Args:
        session: SQLModel session
        n: Number of questions to create

    Returns:
        Quiz instance with questions and answers
    """
    # Create a topic first
    topic = TopicFactory.build()
    session.add(topic)
    session.flush()

    # Create quiz with the topic_id
    quiz = QuizFactory.build(topic_id=topic.id)
    session.add(quiz)
    session.flush()

    # Create questions and answers
    for i in range(n):
        question = QuestionFactory.build(topic_id=topic.id)
        session.add(question)
        session.flush()

        # Create one correct answer
        correct_answer = AnswerFactory.build(question_id=question.id, is_correct=True)
        session.add(correct_answer)

        # Create 3 incorrect answers
        for _ in range(3):
            incorrect_answer = AnswerFactory.build(
                question_id=question.id, is_correct=False
            )
            session.add(incorrect_answer)

        # Link question to quiz
        quiz_question = QuizQuestion(
            quiz_id=quiz.id, question_id=question.id, position=i
        )
        session.add(quiz_question)

    session.flush()
    return quiz
