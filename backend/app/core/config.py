from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    DATABASE_URL: str
    SECRET_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
