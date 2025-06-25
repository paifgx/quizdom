from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> Iterator[TestClient]:
    """Provide a TestClient that runs startup events."""
    with TestClient(app) as c:
        yield c


def test_health_check(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_users_endpoint_removed(client: TestClient) -> None:
    """Test that the insecure users endpoint has been removed."""
    response = client.get("/users/999")
    assert response.status_code == 404
