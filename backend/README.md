# QUIZDOM Backend Project Skeleton

This repository contains the backend skeleton for **QUIZDOM – Rise of the Wise**. It is built with **FastAPI**, using **SQLModel** for ORM and **PostgreSQL** for persistence. The project is prepared for containerisation with Docker and includes a GitHub Actions workflow for continuous integration.

## Project Structure

```
app/
  core/
    config.py        # Pydantic settings (via pydantic-settings)
  db/
    models.py        # SQLModel models
    session.py       # Database engine and session
  routers/
    auth.py          # Authentication routes
    user.py          # User management routes
    quiz.py          # Quiz routes
  main.py            # FastAPI app instance

.tests/
  test_app.py        # Example Pytest tests

Dockerfile           # Build the API container
docker-compose.yml   # Run the API and PostgreSQL
requirements.txt     # Python dependencies
.env.example         # Example environment variables
.github/workflows/ci.yml  # Linting and tests
```

## Environment Variables

The following environment variables can be configured:

- `DATABASE_URL`: PostgreSQL connection string (required)
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins for CORS (optional, defaults to localhost development URLs)

Example for production:

```bash
export CORS_ALLOWED_ORIGINS="https://your-frontend-domain.com,https://www.your-frontend-domain.com"
```

## Development

1. Create a `.env` file based on `.env.example` and adjust the `DATABASE_URL` as needed.
2. Install dependencies and run the app:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Alternatively, start everything with Docker:

```bash
docker-compose up --build
```

### Using a Dev Container

A single **devcontainer** at the repository root provides everything needed to
work on the backend and frontend. Open the project in VS Code or GitHub
Codespaces and the environment will be prepared automatically with all
dependencies installed.

## Testing

Run the test suite and lint checks with:

```bash
flake8 .
black --check .
isort --check-only .
pytest
```

The CI workflow runs these commands automatically on pushes and pull requests.
