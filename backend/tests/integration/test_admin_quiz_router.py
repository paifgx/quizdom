"""Integration tests for admin quiz router endpoints."""

from fastapi import status
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.db.models import Topic


def test_quiz_lifecycle(admin_client: TestClient, session: Session):
    """Test the full lifecycle of a quiz: create -> publish -> archive."""
    # 1. Create a topic
    topic = Topic(title="Lifecycle Topic", description="A topic for testing")
    session.add(topic)
    session.commit()
    session.refresh(topic)

    # 2. Create a quiz
    create_data = {
        "title": "Lifecycle Test Quiz",
        "topic_id": topic.id,
        "difficulty": 2,
        "question_ids": [],
    }
    response = admin_client.post("/v1/admin/quizzes", json=create_data)
    assert response.status_code == status.HTTP_201_CREATED
    quiz_data = response.json()
    quiz_id = quiz_data["id"]
    assert quiz_data["status"] == "draft"

    # 3. Check GET quizzes contains the new draft quiz
    response = admin_client.get("/v1/admin/quizzes")
    assert response.status_code == status.HTTP_200_OK
    quizzes = response.json()
    my_quiz = next((q for q in quizzes if q["id"] == quiz_id), None)
    assert my_quiz is not None
    assert my_quiz["status"] == "draft"

    # 4. Attempt to publish (should fail as it has no questions)
    response = admin_client.post(f"/v1/admin/quizzes/{quiz_id}/publish")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "mindestens eine Frage enthalten" in response.json()["detail"]

    # 5. Add a question to the quiz
    question_data = {
        "topic_id": topic.id,
        "difficulty": 2,
        "content": "A question for the lifecycle",
        "answers": [
            {"content": "Correct", "is_correct": True},
            {"content": "Incorrect", "is_correct": False},
        ],
    }
    q_response = admin_client.post("/v1/admin/questions", json=question_data)
    assert q_response.status_code == status.HTTP_201_CREATED
    question_id = q_response.json()["id"]

    update_data = {"question_ids": [question_id]}
    response = admin_client.put(f"/v1/admin/quizzes/{quiz_id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK

    # 6. Publish the quiz (should succeed)
    response = admin_client.post(f"/v1/admin/quizzes/{quiz_id}/publish")
    assert response.status_code == status.HTTP_200_OK
    published_quiz = response.json()
    assert published_quiz["status"] == "published"
    assert published_quiz["published_at"] is not None

    # 7. Archive the quiz
    response = admin_client.post(f"/v1/admin/quizzes/{quiz_id}/archive")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "archived"

    # 8. Reactivate the quiz
    response = admin_client.post(f"/v1/admin/quizzes/{quiz_id}/reactivate")
    assert response.status_code == status.HTTP_200_OK
    reactivated_quiz = response.json()
    assert reactivated_quiz["status"] == "draft"
    assert reactivated_quiz["published_at"] is None
