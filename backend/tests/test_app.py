from collections.abc import Iterator

import pytest
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture()
def client() -> Iterator[TestClient]:
    """Provide a TestClient that runs startup events."""
    with TestClient(app) as c:
        yield c


def test_health_check(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_read_user_not_found(client: TestClient) -> None:
    response = client.get("/users/999")
    assert response.status_code == 404
