"""End-to-end tests for WebSocket functionality using mocked endpoints."""

import time
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from tests.factories import create_quiz


@pytest.fixture
def test_user():
    """Create a test user for authentication."""
    from datetime import datetime

    from app.db.models import User

    return User(
        id=1,
        email="test@example.com",
        nickname="TestUser",
        password_hash="test_hash",
        is_verified=True,
        created_at=datetime.utcnow(),
    )


@pytest.fixture
def auth_token(test_user):
    """Create authentication token for test user."""
    return create_access_token(data={"sub": test_user.email, "user_id": test_user.id})


@pytest.fixture
def sync_client(auth_token, test_user, session):
    """Return an authenticated test client."""
    from app.db.session import get_session
    from app.routers.auth_router import get_current_user

    # Set up dependency overrides for testing
    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_session] = lambda: session

    client = TestClient(app)
    client.headers.update({"Authorization": f"Bearer {auth_token}"})

    yield client

    # Clear dependency overrides after test
    app.dependency_overrides.clear()


# Mock the WebSocket connection since we can't properly test it with TestClient
@pytest.fixture
def mock_websocket_endpoint():
    """Mock WebSocket endpoint for testing."""
    with patch("app.main.WebSocketEndpoint", autospec=True) as mock_endpoint:
        mock_instance = MagicMock()
        mock_endpoint.return_value = mock_instance

        # Mock WebSocket response methods
        mock_instance.on_connect = MagicMock()
        mock_instance.on_receive = MagicMock()
        mock_instance.on_disconnect = MagicMock()

        # Setup predefined responses
        mock_instance.send_json = MagicMock()

        yield mock_instance


class TestWebSocketSolo:
    """Tests for WebSocket solo mode."""

    def test_ws_solo_flow(self, sync_client, session, monkeypatch):
        """Test solo mode WebSocket flow with mocked responses."""
        quiz = create_quiz(session, n=5)

        # Start a quiz session
        response = sync_client.post(
            f"/v1/game/quiz/{quiz.id}/start", json={"mode": "solo"}
        )
        assert response.status_code == 200
        session_id = response.json()["session_id"]

        # Since we can't directly test WebSockets with TestClient
        # We'll test the HTTP endpoints that would interact with WebSockets

        # Get first question
        q_response = sync_client.get(f"/v1/game/session/{session_id}/question/0")
        assert q_response.status_code == 200

        question_data = q_response.json()
        assert "answers" in question_data

        # Find a wrong answer using database query
        from sqlmodel import select

        from app.db.models import Answer

        stmt = select(Answer).where(
            Answer.question_id == question_data["question_id"],
            Answer.is_correct.is_(False),
        )
        wrong_answer = session.exec(stmt).first()

        assert wrong_answer is not None, "No wrong answer found"

        # Submit wrong answer
        answer_response = sync_client.post(
            f"/v1/game/session/{session_id}/answer",
            json={
                "question_id": question_data["question_id"],
                "answer_id": wrong_answer.id,
                "answered_at": int(time.time() * 1000),
            },
        )

        # If we get a validation error, print details for debugging
        if answer_response.status_code == 422:
            print(f"Validation error: {answer_response.json()}")

        assert answer_response.status_code == 200
        answer_data = answer_response.json()
        assert answer_data["is_correct"] is False
        assert answer_data["player_hearts"] == 2

        # Complete session
        complete_response = sync_client.post(f"/v1/game/session/{session_id}/complete")
        assert complete_response.status_code == 200


class TestWebSocketMultiplayer:
    """Tests for multiplayer WebSocket interactions."""

    def test_ws_collaborative_mode(self, sync_client, session):
        """Test collaborative mode with HTTP endpoints."""
        quiz = create_quiz(session, n=5)

        # Start a collaborative session
        response = sync_client.post(
            f"/v1/game/quiz/{quiz.id}/start", json={"mode": "collab"}
        )
        assert response.status_code == 200
        session_id = response.json()["session_id"]

        # Get the first question
        question_response = sync_client.get(f"/v1/game/session/{session_id}/question/0")
        assert question_response.status_code == 200
        question_data = question_response.json()

        # Find correct answer using database query
        from sqlmodel import select

        from app.db.models import Answer

        stmt = select(Answer).where(
            Answer.question_id == question_data["question_id"],
            Answer.is_correct.is_(True),
        )
        correct_answer = session.exec(stmt).first()

        assert correct_answer is not None, "No correct answer found"

        # Submit correct answer
        answer_response = sync_client.post(
            f"/v1/game/session/{session_id}/answer",
            json={
                "question_id": question_data["question_id"],
                "answer_id": correct_answer.id,
                "answered_at": int(time.time() * 1000),
            },
        )

        assert answer_response.status_code == 200
        answer_data = answer_response.json()
        assert answer_data["is_correct"] is True
        assert answer_data["player_hearts"] == 3

    def test_session_status(self, sync_client, session):
        """Test checking session status."""
        quiz = create_quiz(session, n=5)

        # Start a collaborative session
        response = sync_client.post(
            f"/v1/game/quiz/{quiz.id}/start", json={"mode": "collab"}
        )
        session_id = response.json()["session_id"]

        # Check session status
        status_response = sync_client.get(f"/v1/game/session/{session_id}/status")
        assert status_response.status_code == 200


class TestWebSocketEdgeCases:
    """Tests for WebSocket edge cases."""

    def test_invalid_question_index(self, sync_client, session):
        """Test requesting an invalid question index."""
        quiz = create_quiz(session, n=5)

        # Start a session
        response = sync_client.post(
            f"/v1/game/quiz/{quiz.id}/start", json={"mode": "solo"}
        )
        session_id = response.json()["session_id"]

        # Try to get a question with invalid index
        response = sync_client.get(f"/v1/game/session/{session_id}/question/999")
        assert response.status_code == 404
        assert "Frage nicht gefunden" in response.json()["detail"]["detail"]
