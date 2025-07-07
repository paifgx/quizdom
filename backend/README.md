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
- `ENABLE_LOBBY`: Enable pre-game lobby with ready flow and countdown (optional, defaults to true)

Example for production:

```bash
export CORS_ALLOWED_ORIGINS="https://your-frontend-domain.com,https://www.your-frontend-domain.com"
export ENABLE_LOBBY=true
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

## Game Flow

### Pre-Game Lobby System

The game flow for multiplayer modes (Duel/Competitive and Team-Battle/Collaborative) includes a pre-game lobby:

1. **Session Creation**: When a session is created for multiplayer modes, it starts in `WAITING` status
2. **Player Join**: Players join the session via invite link or session ID. Maximum 2 players allowed.
3. **Ready Phase**:
   - Players enter the lobby at `/lobby/{sessionId}`
   - Each player can toggle their ready status using `PUT /v1/game/session/{session_id}/ready`
   - Ready status is synchronized in real-time via WebSocket events
4. **Countdown**:
   - When both players are ready, a 5-second countdown automatically begins
   - Session status changes to `COUNTDOWN`
   - Countdown is synchronized across clients using server timestamps
5. **Host Pause** (optional):
   - During countdown, the host can pause using `POST /v1/game/session/{session_id}/pause`
   - This returns the session to `WAITING` status and resets all ready states
6. **Game Start**:
   - After countdown completes, session becomes `ACTIVE`
   - Timer starts only now, ensuring fair play
   - First question is sent to all players

### Session Status Values

- `WAITING`: Session created, waiting for players to ready up
- `COUNTDOWN`: Both players ready, 5-second countdown in progress
- `ACTIVE`: Game in progress
- `PAUSED`: Reserved for countdown interruption (not mid-game pause)
- `FINISHED`: Game completed

### WebSocket Events

- `player-ready`: Broadcast when any player toggles ready status
- `session-countdown`: Sent when countdown starts, includes `seconds` and `start_at` timestamp
- `session-paused`: Sent when host pauses countdown
- `session-start`: Sent when game becomes active after countdown
- `player-joined`: Sent when a new player joins the session

### Event Payload Examples

```json
// player-ready event
{
  "event": "player-ready",
  "payload": {
    "players": [
      {
        "id": "123",
        "name": "Player 1",
        "ready": true,
        "is_host": true
      },
      {
        "id": "456",
        "name": "Player 2",
        "ready": false,
        "is_host": false
      }
    ]
  }
}

// session-countdown event
{
  "event": "session-countdown",
  "payload": {
    "seconds": 5,
    "start_at": "2024-01-01T12:00:00.000Z"
  }
}
```
