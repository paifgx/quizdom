from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/quizdom"
    SECRET_KEY: str = "your-secret-key-change-in-production"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
