from fastapi import FastAPI

from app.db.session import init_db
from app.routers import admin, auth, quiz, user

app = FastAPI(title="QUIZDOM Backend")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(admin.router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/", tags=["health"])
def read_health() -> dict[str, str]:
    return {"status": "ok"}
