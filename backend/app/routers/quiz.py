"""
Quiz game router with support for different game modes.
Handles timing, scoring, and game state management.
"""

from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

router = APIRouter(prefix="/v1/quiz", tags=["quiz"])

# In-memory game sessions (in production, use Redis or database)
game_sessions: Dict[str, "GameSession"] = {}


class Question(BaseModel):
    """Question model with server timestamp."""

    id: str
    text: str
    answers: List[str]
    correct_answer: int
    show_timestamp: int  # Unix timestamp in milliseconds


class PlayerAnswer(BaseModel):
    """Player answer submission."""

    player_id: str
    question_id: str
    answer_index: int
    answered_at: int  # Unix timestamp in milliseconds


class GameSession:
    """Game session management class."""

    def __init__(self, session_id: str, mode: str, topic_id: str, players: List[str]):
        self.session_id = session_id
        self.mode = mode
        self.topic_id = topic_id
        self.players = {player_id: {"score": 0, "hearts": 3} for player_id in players}
        self.questions: List[Question] = []
        self.current_question_index = 0
        self.team_hearts = 3 if mode == "collaborative" else None
        self.team_score = 0 if mode == "collaborative" else None
        self.status = "waiting"
        self.websockets: Dict[str, WebSocket] = {}

    def add_websocket(self, player_id: str, websocket: WebSocket):
        """Add player websocket connection."""
        self.websockets[player_id] = websocket

    def remove_websocket(self, player_id: str):
        """Remove player websocket connection."""
        self.websockets.pop(player_id, None)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected players."""
        disconnected = []
        for player_id, ws in self.websockets.items():
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(player_id)

        # Clean up disconnected websockets
        for player_id in disconnected:
            self.remove_websocket(player_id)

    def calculate_points(self, response_time_ms: int) -> int:
        """Calculate points based on response time."""
        if response_time_ms <= 3000:  # 0-3 seconds
            return 100
        elif response_time_ms <= 6000:  # 3-6 seconds
            return 50
        else:
            return 0


@router.post("/session/create")
async def create_game_session(mode: str, topic_id: str, player_ids: List[str]):
    """Create a new game session."""
    session_id = f"{mode}_{topic_id}_{datetime.now().timestamp()}"
    session = GameSession(session_id, mode, topic_id, player_ids)

    # Load questions for the topic (mock data for now)
    session.questions = [
        Question(
            id="q1",
            text="What is the capital of France?",
            answers=["Berlin", "Paris", "Madrid", "Lisbon"],
            correct_answer=1,
            show_timestamp=0,
        ),
        Question(
            id="q2",
            text="What is 2 + 2?",
            answers=["3", "4", "5", "6"],
            correct_answer=1,
            show_timestamp=0,
        ),
        # Add more questions as needed
    ]

    game_sessions[session_id] = session

    return {
        "session_id": session_id,
        "mode": mode,
        "topic_id": topic_id,
        "players": player_ids,
        "total_questions": len(session.questions),
    }


@router.get("/session/{session_id}/question/current")
async def get_current_question(session_id: str):
    """Get the current question with server timestamp."""
    session = game_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.current_question_index >= len(session.questions):
        return {"status": "completed"}

    question = session.questions[session.current_question_index]
    # Set show timestamp when question is requested
    question.show_timestamp = int(datetime.now().timestamp() * 1000)

    return {
        "question": question.dict(),
        "question_number": session.current_question_index + 1,
        "total_questions": len(session.questions),
    }


@router.post("/session/{session_id}/answer")
async def submit_answer(session_id: str, answer: PlayerAnswer):
    """Submit an answer and calculate score."""
    session = game_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get current question
    question = session.questions[session.current_question_index]

    # Calculate response time
    response_time = answer.answered_at - question.show_timestamp

    # Check if answer is correct
    is_correct = answer.answer_index == question.correct_answer

    # Calculate points
    points = session.calculate_points(response_time) if is_correct else 0

    # Update player score
    if answer.player_id in session.players:
        session.players[answer.player_id]["score"] += points

        # Handle hearts for wrong answers
        if not is_correct:
            if session.mode in ["solo", "competitive"]:
                session.players[answer.player_id]["hearts"] -= 1

    # Update team score for collaborative mode
    if session.mode == "collaborative" and is_correct:
        session.team_score = (session.team_score or 0) + points

    # Broadcast update based on mode
    if session.mode == "competitive":
        await session.broadcast(
            {
                "type": "compUpdate",
                "players": [
                    {"id": pid, "score": pdata["score"], "hearts": pdata["hearts"]}
                    for pid, pdata in session.players.items()
                ],
                "current_question": session.current_question_index,
            }
        )
    elif session.mode == "collaborative":
        await session.broadcast(
            {
                "type": "collabUpdate",
                "team_score": session.team_score,
                "team_hearts": session.team_hearts,
                "current_question": session.current_question_index,
            }
        )

    return {
        "is_correct": is_correct,
        "points_earned": points,
        "response_time_ms": response_time,
        "player_score": session.players[answer.player_id]["score"],
        "player_hearts": session.players[answer.player_id]["hearts"],
    }


@router.post("/session/{session_id}/next")
async def next_question(session_id: str):
    """Move to the next question."""
    session = game_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.current_question_index += 1

    # Check if game is over
    if session.current_question_index >= len(session.questions):
        # Calculate final results
        if session.mode == "solo":
            player_id = list(session.players.keys())[0]
            player = session.players[player_id]
            result = "win" if player["hearts"] > 0 else "fail"

            await session.broadcast(
                {
                    "type": "gameOver",
                    "mode": session.mode,
                    "result": result,
                    "score": player["score"],
                    "hearts_remaining": player["hearts"],
                }
            )

        elif session.mode == "competitive":
            # Find winner
            winner = max(session.players.items(), key=lambda x: x[1]["score"])

            await session.broadcast(
                {
                    "type": "gameOver",
                    "mode": session.mode,
                    "result": "win",
                    "winner_id": winner[0],
                    "scores": {
                        pid: pdata["score"] for pid, pdata in session.players.items()
                    },
                }
            )

        elif session.mode == "collaborative":
            result = "win" if (session.team_hearts or 0) > 0 else "fail"

            await session.broadcast(
                {
                    "type": "gameOver",
                    "mode": session.mode,
                    "result": result,
                    "score": session.team_score,
                    "hearts_remaining": session.team_hearts,
                }
            )

    return {"status": "next_question", "current_index": session.current_question_index}


@router.websocket("/session/{session_id}/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, player_id: str):
    """WebSocket endpoint for real-time game updates."""
    await websocket.accept()

    session = game_sessions.get(session_id)
    if not session:
        await websocket.close(code=4004, reason="Session not found")
        return

    session.add_websocket(player_id, websocket)

    try:
        # Send initial state
        await websocket.send_json(
            {"type": "connected", "session_id": session_id, "player_id": player_id}
        )

        # Keep connection alive
        while True:
            try:
                # Wait for messages (heartbeat)
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                break

    finally:
        session.remove_websocket(player_id)

        # Clean up empty sessions
        if not session.websockets:
            game_sessions.pop(session_id, None)
