"""Unit tests for the QuizAdminService."""

from unittest.mock import MagicMock

import pytest

from app.db.models import Quiz, QuizStatus
from app.services.quiz_admin_service import QuizAdminService


def test_publish_quiz_no_questions_raises_error():
    """
    Test that publish_quiz raises a ValueError if the quiz has no questions.
    """
    # 1. Setup
    mock_session = MagicMock()
    quiz_without_questions = Quiz(id=1, title="Empty Quiz", topic_id=1, difficulty=1)

    # Mock the return value for getting the quiz
    mock_session.get.return_value = quiz_without_questions

    # Mock the return value for the question count query
    mock_exec = MagicMock()
    mock_exec.one.return_value = 0
    mock_session.exec.return_value = mock_exec

    # 2. Service instantiation
    service = QuizAdminService(db=mock_session)

    # 3. Call and Assert
    with pytest.raises(ValueError, match="Quiz muss mindestens eine Frage enthalten"):
        service.publish_quiz(quiz_id=1)

    # Verify that status was not changed
    assert quiz_without_questions.status == QuizStatus.DRAFT
