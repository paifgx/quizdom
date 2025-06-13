from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """User model for database and API."""

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)
