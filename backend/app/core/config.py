from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent.parent / ".env.example"


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Base configuration
    BASE_URL: str = "http://localhost:8000"

    # Database configuration
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/quizdom"

    # Email configuration
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = ""

    # Security configuration
    SECRET_KEY: str  # Must be provided via environment variables
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = ConfigDict(
        env_file=str(env_path), env_file_encoding="utf-8")  # TODO: change to .env

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.SECRET_KEY:
            raise ValueError(
                "SECRET_KEY must be set in"
                "environment variables for secure deployments."
            )


settings = Settings()
