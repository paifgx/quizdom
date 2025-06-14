from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Base configuration
    BASE_URL: str = "http://localhost:8000"
    
    # Database configuration
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/quizdom"
    
    # Email configuration
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = ""
    
    # Security configuration
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production!
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
