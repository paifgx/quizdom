from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.session import init_db
from app.routers import auth, quiz, user


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    init_db()
    yield


app = FastAPI(title="QUIZDOM Backend", lifespan=lifespan)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])


@app.get("/", tags=["health"])
def read_health() -> dict[str, str]:
    return {"status": "ok"}
