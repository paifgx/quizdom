from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import init_db
from app.routers import admin, auth, quiz, user


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    init_db()
    yield


app = FastAPI(title="QUIZDOM Backend", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],  # Frontend dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(admin.router)


@app.get("/", tags=["health"])
def read_health() -> dict[str, str]:
    return {"status": "ok"}
