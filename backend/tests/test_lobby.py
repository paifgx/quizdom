"""Tests for lobby functionality."""

import asyncio

import pytest
from fastapi import status
from sqlmodel import Session, select

from app.core.config import settings
from app.db.models import GameStatus, SessionPlayers


@pytest.mark.asyncio
async def test_ready_endpoint_requires_lobby_feature(
    client, auth_headers, test_game_session_comp
):
    """Test that ready endpoint requires ENABLE_LOBBY feature flag."""
    # Temporarily disable the feature
    original_value = settings.enable_lobby
    settings.enable_lobby = False

    try:
        response = client.put(
            f"/v1/game/session/{test_game_session_comp.id}/ready",
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_501_NOT_IMPLEMENTED
        assert "Lobby-Feature ist nicht aktiviert" in response.json()["detail"]
    finally:
        settings.enable_lobby = original_value


@pytest.mark.asyncio
async def test_ready_toggle(client, auth_headers, test_game_session_comp, db: Session):
    """Test toggling ready status."""
    settings.enable_lobby = True

    # Set session to WAITING status
    test_game_session_comp.status = GameStatus.WAITING
    db.add(test_game_session_comp)
    db.commit()

    # Toggle ready to true
    response = client.put(
        f"/v1/game/session/{test_game_session_comp.id}/ready",
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["ready"] is True

    # Check database
    player = db.exec(
        select(SessionPlayers).where(
            SessionPlayers.session_id == test_game_session_comp.id
        )
    ).first()
    assert player is not None
    assert player.ready is True

    # Toggle ready back to false
    response = client.put(
        f"/v1/game/session/{test_game_session_comp.id}/ready",
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["ready"] is False


@pytest.mark.asyncio
async def test_ready_requires_waiting_status(
    client, auth_headers, test_game_session_comp, db: Session
):
    """Test that ready endpoint requires session to be in WAITING status."""
    settings.enable_lobby = True

    # Ensure session is ACTIVE
    test_game_session_comp.status = GameStatus.ACTIVE
    db.add(test_game_session_comp)
    db.commit()

    response = client.put(
        f"/v1/game/session/{test_game_session_comp.id}/ready",
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "nicht im Wartemodus" in response.json()["detail"]


@pytest.mark.asyncio
async def test_pause_countdown_host_only(
    client, auth_headers, auth_headers_player2, test_game_session_comp, db: Session
):
    """Test that only host can pause countdown."""
    settings.enable_lobby = True

    # Set session to COUNTDOWN status
    test_game_session_comp.status = GameStatus.COUNTDOWN
    db.add(test_game_session_comp)
    db.commit()

    # Try as non-host (player2)
    response = client.post(
        f"/v1/game/session/{test_game_session_comp.id}/pause",
        headers=auth_headers_player2,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Nur der Host" in response.json()["detail"]

    # Try as host (player1)
    response = client.post(
        f"/v1/game/session/{test_game_session_comp.id}/pause",
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    # Check session is back to WAITING
    db.refresh(test_game_session_comp)
    assert test_game_session_comp.status == GameStatus.WAITING


@pytest.mark.asyncio
async def test_join_limit_two_players(
    client, auth_headers, auth_headers_player2, test_game_session_comp, db: Session
):
    """Test that sessions are limited to 2 players."""
    # First player is already in from fixture
    # Add second player
    response = client.post(
        f"/v1/game/session/{test_game_session_comp.id}/join",
        headers=auth_headers_player2,
    )
    assert response.status_code == status.HTTP_200_OK

    # Try to add third player (create new auth headers)
    third_player_headers = {"Authorization": "Bearer mock-token-player3"}

    response = client.post(
        f"/v1/game/session/{test_game_session_comp.id}/join",
        headers=third_player_headers,
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "bereits voll" in response.json()["detail"]["detail"]


@pytest.mark.asyncio
async def test_countdown_starts_when_both_ready(
    client, auth_headers, auth_headers_player2, test_game_session_comp, db: Session
):
    """Test that countdown starts automatically when both players are ready."""
    settings.enable_lobby = True

    # Set session to WAITING
    test_game_session_comp.status = GameStatus.WAITING
    db.add(test_game_session_comp)
    db.commit()

    # Add second player
    response = client.post(
        f"/v1/game/session/{test_game_session_comp.id}/join",
        headers=auth_headers_player2,
    )
    assert response.status_code == status.HTTP_200_OK

    # First player ready
    response = client.put(
        f"/v1/game/session/{test_game_session_comp.id}/ready",
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_200_OK

    # Session should still be WAITING
    db.refresh(test_game_session_comp)
    assert test_game_session_comp.status == GameStatus.WAITING

    # Second player ready - this should trigger countdown
    response = client.put(
        f"/v1/game/session/{test_game_session_comp.id}/ready",
        headers=auth_headers_player2,
    )
    assert response.status_code == status.HTTP_200_OK

    # Session should now be COUNTDOWN
    db.refresh(test_game_session_comp)
    assert test_game_session_comp.status == GameStatus.COUNTDOWN
    assert test_game_session_comp.countdown_started_at is not None


@pytest.mark.asyncio
async def test_session_activates_after_countdown(
    client, auth_headers, auth_headers_player2, test_game_session_comp, db: Session
):
    """Test that session becomes ACTIVE after 5-second countdown."""
    settings.enable_lobby = True

    # Set up session with both players ready
    test_game_session_comp.status = GameStatus.WAITING
    db.add(test_game_session_comp)

    # Add second player
    player2 = SessionPlayers(
        session_id=test_game_session_comp.id,
        user_id=2,  # Different user ID
        hearts_left=3,
        score=0,
        ready=False,
    )
    db.add(player2)
    db.commit()

    # Both players ready
    for headers in [auth_headers, auth_headers_player2]:
        response = client.put(
            f"/v1/game/session/{test_game_session_comp.id}/ready",
            headers=headers,
        )
        assert response.status_code == status.HTTP_200_OK

    # Wait for countdown to complete (5 seconds + buffer)
    await asyncio.sleep(6)

    # Check session is now ACTIVE
    db.refresh(test_game_session_comp)
    assert test_game_session_comp.status == GameStatus.ACTIVE
    assert test_game_session_comp.started_at is not None
