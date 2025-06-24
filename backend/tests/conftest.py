import os
import tempfile
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel

# Use a temporary SQLite database for tests
_db_fd, _db_path = tempfile.mkstemp()
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db_path}")
os.environ.setdefault("SECRET_KEY", "test-secret")

from app.main import app
from app.db.session import engine

SQLModel.metadata.create_all(engine)


@pytest.fixture(autouse=True)
def _reset_db() -> Iterator[None]:
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield


@pytest.fixture()
def client() -> Iterator[TestClient]:
    with TestClient(app) as c:
        yield c
