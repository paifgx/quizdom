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

## Development

1. Create a `.env` file based on `.env.example` and adjust the `DATABASE_URL` as needed.
2. Install dependencies and run the app:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Alternatively, start everything with Docker:

```bash
docker-compose up --build
```

## Testing

Run the test suite and lint checks with:

```bash
flake8 .
black --check .
isort --check-only .
pytest
```

The CI workflow runs these commands automatically on pushes and pull requests.
