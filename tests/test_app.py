from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_read_user_not_found() -> None:
    response = client.get("/users/999")
    assert response.status_code == 404
