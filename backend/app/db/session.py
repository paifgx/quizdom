from app.core.config import settings
from sqlmodel import Session, SQLModel, create_engine

engine = create_engine(settings.DATABASE_URL, echo=False)


def get_session():
    """Provide a transactional scope around a series of operations."""
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """Create database tables."""
    SQLModel.metadata.create_all(engine)
