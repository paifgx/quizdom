from typing import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.database_url, echo=False)


def get_session() -> Generator[Session, None, None]:
    """Provide a transactional scope around a series of operations."""
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """Create database tables."""
    SQLModel.metadata.create_all(engine)
