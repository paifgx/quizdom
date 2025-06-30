"""Main FastAPI application.

This module initializes the FastAPI app with proper middleware,
routing, and lifecycle management for the Quizdom backend.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import init_db
from app.routers.admin_router import router as admin_router
from app.routers.auth_router import router as auth_router
from app.routers.game_router import router as game_router
from app.routers.user_router import router as user_router


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

# WHY: CORS middleware allows frontend to make requests from different origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
        "http://127.0.0.1:5173",  # Localhost variant
        "http://127.0.0.1:3000",  # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(game_router)


@app.get("/", tags=["health"])
def read_health() -> dict[str, str]:
    """Health check endpoint.

    Returns the API status for monitoring and health checks.
    Used by load balancers and monitoring systems.
    """
    return {"status": "ok", "message": "Quizdom API is running"}
