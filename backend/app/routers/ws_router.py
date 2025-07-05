"""WebSocket router for real-time game session events."""

import asyncio
import contextlib
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlmodel import Session, select

from app.core.security import verify_token
from app.db.models import GameSession, SessionPlayers, User
from app.db.session import get_session
from app.services.game_service import GameService

router = APIRouter()


async def get_current_user_from_ws(
    websocket: WebSocket,
    token: Optional[str] = None,
    db: Session = Depends(get_session),
) -> User:
    """Authenticate a WebSocket connection using a token.

    Args:
        websocket: The WebSocket connection
        token: Optional token from query parameters
        db: Database session

    Returns:
        The authenticated user

    Raises:
        WebSocketException: If authentication fails
    """
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        token_data = verify_token(token)
        if token_data is None or token_data.email is None:
            raise ValueError("Invalid token data")

        user_email = token_data.email

        user = db.exec(select(User).where(User.email == user_email)).first()
        if not user:
            raise ValueError("User not found")
        return user
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


class ConnectionManager:
    """Manage active WebSocket connections for game sessions."""

    def __init__(self):
        # Map of session_id -> list of connected WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Map of WebSocket -> user_id
        self.connection_user_map: Dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, session_id: int, user_id: int):
        """Register a new WebSocket connection for a session."""
        await websocket.accept()

        if session_id not in self.active_connections:
            self.active_connections[session_id] = []

        self.active_connections[session_id].append(websocket)
        self.connection_user_map[websocket] = user_id

    def disconnect(self, websocket: WebSocket, session_id: int):
        """Remove a WebSocket connection when it disconnects."""
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)

            # Clean up empty sessions
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

        if websocket in self.connection_user_map:
            del self.connection_user_map[websocket]

    async def broadcast(
        self,
        message: Dict[str, Any],
        session_id: int,
        exclude: Optional[WebSocket] = None,
    ):
        """Broadcast a message to all connected clients for a session."""
        if session_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[session_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except WebSocketDisconnect:
                        disconnected.append(connection)

            # Clean up any connections that failed
            for conn in disconnected:
                self.disconnect(conn, session_id)

    def get_connected_users(self, session_id: int) -> List[int]:
        """Get list of user IDs connected to a session."""
        if session_id not in self.active_connections:
            return []

        return [
            self.connection_user_map[conn]
            for conn in self.active_connections[session_id]
            if conn in self.connection_user_map
        ]


# Global connection manager
manager = ConnectionManager()


@router.websocket("/v1/game/session/{session_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: int,
    token: Optional[str] = None,
    db: Session = Depends(get_session),
):
    """WebSocket endpoint for real-time game session events.

    Manages the full lifecycle of a WebSocket connection:
    - Authenticates the user with token
    - Verifies session exists and user has access
    - Sends session start and initial question data
    - Processes incoming events (answers, navigation)
    - Broadcasts events to other connected players
    - Handles disconnection

    Args:
        websocket: The WebSocket connection
        session_id: The game session ID
        token: Authentication token via query parameter
        db: Database session
    """
    # Authenticate user
    try:
        user = await get_current_user_from_ws(websocket, token, db)
    except HTTPException:
        return  # WebSocket already closed in the authentication function

    # Verify session exists and user has access
    session = db.get(GameSession, session_id)
    if not session:
        await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
        return

    # Check if user is a participant
    player_stmt = (
        select(SessionPlayers)
        .where(SessionPlayers.session_id == session_id)
        .where(SessionPlayers.user_id == user.id)
    )
    player = db.exec(player_stmt).first()

    if not player:
        await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
        return

    # Accept connection and add to connection manager
    assert user.id is not None, "User ID must be set"
    await manager.connect(websocket, session_id, user.id)

    # ------------------------------------------------------------------
    # KEEP-ALIVE PINGS
    # ------------------------------------------------------------------
    # WHY: In local test-environment Uvicorn closes idle WebSocket
    # connections after ~20 s. We spawn a background task that sends a
    # lightweight keep-alive message every 10 s so the connection stays
    # open during RTT/Jitter tests where clients only send 'ping' events.

    async def _keep_alive() -> None:
        try:
            while True:
                await asyncio.sleep(10)  # shorter than default 20 s timeout
                try:
                    await websocket.send_json({"event": "server-ping"})
                except WebSocketDisconnect:
                    break
        except asyncio.CancelledError:
            # Task will be cancelled on disconnect – silent exit
            pass

    keep_alive_task = asyncio.create_task(_keep_alive())

    # Send session-start event
    await websocket.send_json(
        {
            "event": "session-start",
            "payload": {
                "mode": session.mode.value,
                "question_count": (
                    len(session.question_ids) if session.question_ids else 0
                ),
                "current_question": session.current_question_index,
            },
        }
    )

    # If other players are already connected, notify them
    connected_users = manager.get_connected_users(session_id)
    if len(connected_users) > 1:
        # Find all players in this session
        player_stmt = select(SessionPlayers).where(
            SessionPlayers.session_id == session_id
        )
        players = list(db.exec(player_stmt).all())

        # Get all users for the players
        player_details = []
        for idx, player in enumerate(players):
            player_user = db.get(User, player.user_id)
            if player_user:
                player_details.append(
                    {
                        "id": str(player_user.id),
                        "name": player_user.nickname or player_user.email.split("@")[0],
                        "score": player.score,
                        "hearts": player.hearts_left,
                        "is_host": idx == 0,  # First player is the host
                    }
                )

        # Notify all players that someone has joined
        await manager.broadcast(
            {"event": "player-joined", "payload": {"players": player_details}},
            session_id,
        )

    # Initialize game service
    game_service = GameService(db)

    # Send initial question if available and index valid
    if session.question_ids and 0 <= session.current_question_index < len(
        session.question_ids
    ):
        try:
            question_data = game_service.get_question_data(
                session_id=session_id,
                question_index=session.current_question_index,
                user=user,
            )

            await websocket.send_json({"event": "question", "payload": question_data})
        except ValueError:
            # Inconsistent DB state – skip initial question to keep WS alive
            pass

    try:
        # Handle incoming messages
        while True:
            data = await websocket.receive_json()
            event_type = data.get("event")

            # Handle ping-pong for latency testing
            if event_type == "ping":
                # Immediately respond with pong containing the same ID
                await websocket.send_json(
                    {
                        "event": "pong",
                        "id": data.get("id"),
                        "timestamp": data.get("timestamp", 0),
                    }
                )
                continue

            if event_type == "answer":
                # Process answer submission
                answer_id = data.get("answer_id")
                question_id = data.get("question_id")
                answered_at = data.get("answered_at")

                try:
                    # Submit answer through game service
                    (
                        is_correct,
                        points_earned,
                        response_time_ms,
                        player_score,
                        explanation,
                        player_hearts,
                        correct_answer_id,
                    ) = game_service.submit_answer(
                        session_id=session_id,
                        question_id=question_id,
                        answer_id=answer_id,
                        user=user,
                        answered_at=answered_at,
                    )

                    # Create answer result event
                    result_event = {
                        "event": "answer-result",
                        "payload": {
                            "player_id": str(user.id),
                            "is_correct": is_correct,
                            "correct_answer_id": correct_answer_id,
                            "points": points_earned,
                            "player_score": player_score,
                            "hearts_left": player_hearts,
                            "explanation": explanation,
                        },
                    }

                    # Send to all players including this one
                    await manager.broadcast(result_event, session_id)

                    # Check if we should advance to next question
                    # In collaborative mode, wait for all players to answer
                    # In competitive mode, move forward when anyone answers
                    if session.mode.value == "solo" or session.mode.value == "comp":
                        # Move to next question
                        session.current_question_index += 1
                        db.add(session)
                        db.commit()

                        # Send next question if available
                        if (
                            session.question_ids
                            and session.current_question_index
                            < len(session.question_ids)
                        ):
                            question_data = game_service.get_question_data(
                                session_id=session_id,
                                question_index=session.current_question_index,
                                user=user,
                            )

                            next_question_event = {
                                "event": "question",
                                "index": session.current_question_index,
                                "payload": question_data,
                            }

                            await manager.broadcast(next_question_event, session_id)
                        else:
                            # No more questions, session complete
                            complete_result = game_service.complete_session(
                                session_id=session_id, user=user
                            )

                            complete_event = {
                                "event": "session-complete",
                                "payload": {
                                    "result": complete_result.get("result"),
                                    "final_score": complete_result.get("final_score"),
                                    "hearts_remaining": complete_result.get(
                                        "hearts_remaining"
                                    ),
                                    "questions_answered": complete_result.get(
                                        "questions_answered"
                                    ),
                                    "time_taken": complete_result.get("time_taken"),
                                },
                            }

                            await manager.broadcast(complete_event, session_id)
                except ValueError as e:
                    # Send error to this client only
                    await websocket.send_json(
                        {
                            "event": "error",
                            "payload": {"message": str(e), "code": "answer_error"},
                        }
                    )

            elif event_type == "complete":
                # Handle manual session completion
                try:
                    complete_result = game_service.complete_session(
                        session_id=session_id, user=user
                    )

                    complete_event = {
                        "event": "session-complete",
                        "payload": {
                            "result": complete_result.get("result"),
                            "final_score": complete_result.get("final_score"),
                            "hearts_remaining": complete_result.get("hearts_remaining"),
                            "questions_answered": complete_result.get(
                                "questions_answered"
                            ),
                            "time_taken": complete_result.get("time_taken"),
                        },
                    }

                    await manager.broadcast(complete_event, session_id)
                except ValueError as e:
                    await websocket.send_json(
                        {
                            "event": "error",
                            "payload": {"message": str(e), "code": "complete_error"},
                        }
                    )

    except WebSocketDisconnect:
        # Clean up connection when client disconnects
        manager.disconnect(websocket, session_id)

        # Notify other clients about disconnect if appropriate
        if session.mode.value in ["collab", "comp"]:
            await manager.broadcast(
                {
                    "event": "player-disconnected",
                    "payload": {"player_id": str(user.id)},
                },
                session_id,
            )

    # Ensure keep-alive background task terminates
    keep_alive_task.cancel()
    with contextlib.suppress(Exception):
        await keep_alive_task
