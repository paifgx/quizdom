# QUIZDOM

This repository contains the QUIZDOM project. The backend FastAPI application lives in the `backend` directory and the React frontend in `frontend`.

## Development with Dev Containers

A single **devcontainer** is provided to work on both services. Open the repository in a compatible environment (VS Code or GitHub Codespaces) and the container will be built automatically. After the container starts you can run the applications manually:

```bash
# in one terminal for the backend
cd backend && uvicorn app.main:app --reload

# in another terminal for the frontend
cd frontend && pnpm dev
```

Dependencies for both projects are installed automatically after the container is created.

## Production Images

Each service contains a `Dockerfile` for building a production image:

```bash
# Backend
docker build -t quizdom-backend ./backend

# Frontend
docker build -t quizdom-frontend ./frontend
```

These images can be run on any container platform.

See `backend/README.md` and `frontend/README.md` for project specific details.
