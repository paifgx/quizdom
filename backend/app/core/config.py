from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    database_url: str = "postgresql://postgres:postgres@localhost:5432/quizdom"
    secret_key: str = "your-secret-key-change-in-production"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
