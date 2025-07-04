# Testing Framework for Quizdom Backend

This document outlines the testing framework for the Quizdom backend application.

## Test Structure

The test suite is organized into three main categories:

### 1. Unit Tests (`tests/unit/`)
- Test individual components in isolation
- Focus on game logic, services, and utility functions
- No database or external dependencies
- Fast execution

### 2. Integration Tests (`tests/integration/`)
- Test interactions between components
- Database operations with SQLite in-memory database
- API endpoint testing via FastAPI TestClient
- Focus on data flow and error handling

### 3. End-to-End Tests (`tests/e2e/`)
- Test complete workflows
- WebSocket interaction testing
- Game session flows from creation to completion
- Boundary cases and edge conditions

## Test Fixtures

The main fixtures are defined in `tests/conftest.py`:

- `engine`: SQLAlchemy engine with in-memory SQLite
- `session`: Database session with automatic rollback after tests
- `test_user`: User fixture for authentication testing
- `client`: Authenticated TestClient for HTTP endpoints
- `mock_websocket_endpoint`: Fixture for testing WebSocket flows

## Model Factories

We use `factory_boy` to create test models through fixtures in `tests/factories.py`:

- `SQLModelFactory`: Base class for all factories
- `TopicFactory`, `QuizFactory`, `QuestionFactory`, `AnswerFactory`: Model factories
- `create_quiz()`: Helper to create a complete quiz with questions and answers

## WebSocket Testing

WebSocket testing uses a combination of approaches:

1. **Mocked Endpoint Tests**: Use mock objects to simulate WebSocket connections
2. **HTTP API Proxy**: Test WebSocket functionality through HTTP endpoints
3. **TestClient Websockets**: Direct WebSocket testing for basic flows

## Running Tests

Run the entire test suite:

```bash
pytest
```

Run specific test categories:

```bash
pytest tests/unit/
pytest tests/integration/
pytest tests/e2e/
```

Run with coverage:

```bash
pytest --cov=app --cov-report=term
```

## Coverage Targets

- Overall coverage target: 90%
- Unit tests: Focus on service layer (app/services/)
- Integration tests: API endpoints (app/routers/)
- E2E tests: Game flows and WebSocket functionality

## Continuous Integration

Tests are automatically run in the CI pipeline:

1. Lint checks (flake8, mypy)
2. Unit tests
3. Integration tests
4. E2E tests
5. Coverage report

See `.github/workflows/test.yml` for the complete CI configuration.
