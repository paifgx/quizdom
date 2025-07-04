"""Main FastAPI application.

This module initializes the FastAPI app with proper middleware,
routing, and lifecycle management for the Quizdom backend.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import init_db
from app.routers.admin_router import router as admin_router
from app.routers.auth_router import router as auth_router
from app.routers.game_router import router as game_router
from app.routers.user_router import router as user_router
from app.routers.ws_router import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Handle startup and shutdown events.

    Initializes the database connection on startup.
    Provides a clean application lifecycle for FastAPI.
    """
    init_db()
    yield


app = FastAPI(
    title="Quizdom Backend API",
    description="Backend API for the Quizdom quiz application",
    version="1.0.0",
    lifespan=lifespan,
)


def get_allowed_origins() -> list[str]:
    """Get allowed origins from environment variables or use defaults for development."""
    env_origins = os.getenv("CORS_ALLOWED_ORIGINS")
    if env_origins:
        return [origin.strip() for origin in env_origins.split(",")]

    # Default development origins
    return [
        "http://localhost:5173",  # Vite development server
        "http://localhost:3000",  # Alternative development port
        "http://127.0.0.1:5173",  # Alternative localhost format
        "http://127.0.0.1:3000",  # Alternative localhost format
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(game_router)
app.include_router(ws_router)


@app.get("/", tags=["health"])
def read_health() -> dict[str, str]:
    """Health check endpoint.

    Returns the API status for monitoring and health checks.
    Used by load balancers and monitoring systems.
    """
    return {"status": "ok", "message": "Quizdom API is running"}
