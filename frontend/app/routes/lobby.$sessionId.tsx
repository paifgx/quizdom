/**
 * Lobby route for multiplayer games.
 * Manages the pre-game lobby where players can ready up before starting.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LoadingSpinner } from '../components/home/loading-spinner';
import { gameService } from '../services/game';
import { authService } from '../services/auth';
import { connect, WebSocketClient, ConnectionStatus } from '../services/ws';
import { useAuthenticatedGame } from '../hooks/useAuthenticatedGame';
import type { PlayerMeta } from '../services/game';
import type { User } from '../services/auth';
import type { AnyGameEvent, PlayerReadyEvent, SessionCountdownEvent, PlayerJoinedEvent } from '../services/ws';

export function meta() {
  return [
    { title: 'Lobby | Quizdom' },
    {
      name: 'description',
      content: 'Warte auf andere Spieler und bereite dich auf das Quiz vor.',
    },
  ];
}

interface LobbyPlayer extends PlayerMeta {
  ready?: boolean;
}

export default function LobbyPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticatedGame();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [sessionStatus, setSessionStatus] = useState<string>('waiting');
  const [_wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );
  const [currentUserReady, setCurrentUserReady] = useState(false);
  const [countdownOverlay, setCountdownOverlay] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [isHost, setIsHost] = useState(false);
  const [_sessionMode, setSessionMode] = useState<string>('');
  const [quizId, setQuizId] = useState<number | null>(null);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current user safely (avoid SSR issues)
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      const user = authService.getUser();
      setCurrentUser(user);
    }
  }, [isAuthenticated]);

  const currentUserId = currentUser?.id?.toString();

  // Initialize session data
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        navigate('/game-modes');
        return;
      }

      // Don't proceed if not authenticated
      if (!isAuthenticated) {
        return;
      }

      try {
        setLoading(true);

        // First, join the session to register as a participant
        const sessionMeta = await gameService.joinSession(sessionId);
        setQuizId(sessionMeta.quizId || null);
        setTopicId(sessionMeta.topicId || null);

        // Now that we've joined, get the latest status
        const status = await gameService.getSessionStatus(sessionId);

        // Check if session is already active
        if (status.status === 'active') {
          // Redirect directly to game
          if (status.mode === 'comp' || status.mode === 'collab') {
            if (sessionMeta.quizId) {
              navigate(
                `/quiz/${sessionMeta.quizId}/quiz-game?sessionId=${sessionId}`
              );
            } else if (sessionMeta.topicId) {
              navigate(
                `/topics/${sessionMeta.topicId}/quiz-game?sessionId=${sessionId}`
              );
            }
          }
          return;
        }

        setSessionStatus(status.status);
        setSessionMode(status.mode);

        // Set players with ready status
        const playersWithReady = status.players.map(p => ({
          ...p,
          ready: false, // Will be updated via WebSocket
        }));
        setPlayers(playersWithReady);

        // Determine if current user is host
        const hostPlayer = status.players.find(p => p.isHost);
        setIsHost(hostPlayer?.id === currentUserId);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load session:', err);
        setError(
          err instanceof Error ? err.message : 'Fehler beim Laden der Sitzung'
        );
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, navigate, currentUserId, isAuthenticated]);

  // Setup WebSocket connection
  useEffect(() => {
    if (
      !sessionId ||
      !sessionStatus ||
      sessionStatus === 'active' ||
      typeof window === 'undefined' ||
      !isAuthenticated
    ) {
      return;
    }

    const client = connect(sessionId);
    setWsClient(client);

    // Track connection status
    const unsubscribeStatus = client.onStatusChange(status => {
      setConnectionStatus(status);
    });

    // Handle WebSocket messages
    const unsubscribeMessage = client.onMessage((event: AnyGameEvent) => {
      console.log('WebSocket event:', event);

      // Check if it's a WebSocket event with event/payload structure
      if ('event' in event && event.event) {
        switch (event.event) {
          case 'player-ready': {
            const playerReadyEvent = event as PlayerReadyEvent;
            // Update player ready status
            if (playerReadyEvent.payload?.players) {
              const updatedPlayers = playerReadyEvent.payload.players.map((p) => ({
                id: p.id,
                name: p.name,
                score: p.score || 0,
                hearts: p.hearts || 3,
                isHost: p.is_host,
                ready: p.ready || false,
              }));
              setPlayers(updatedPlayers);

              // Update current user ready status
              const currentPlayerData = updatedPlayers.find(
                (p: LobbyPlayer) => p.id === currentUserId
              );
              if (currentPlayerData) {
                setCurrentUserReady(currentPlayerData.ready);
              }
            }
            break;
          }

          case 'session-countdown': {
            const countdownEvent = event as SessionCountdownEvent;
            // Start countdown overlay
            if (countdownEvent.payload?.seconds && countdownEvent.payload?.start_at) {
              setCountdownOverlay(true);

              // Calculate actual countdown based on server time
              const serverStartTime = new Date(countdownEvent.payload.start_at).getTime();
              const now = Date.now();
              const elapsed = Math.max(0, (now - serverStartTime) / 1000);
              const remaining = Math.max(0, countdownEvent.payload.seconds - elapsed);

              // Start countdown
              let currentSeconds = Math.ceil(remaining);
              setCountdownSeconds(currentSeconds);

              const interval = setInterval(() => {
                currentSeconds -= 1;
                if (currentSeconds <= 0) {
                  clearInterval(interval);
                  setCountdownSeconds(0);
                } else {
                  setCountdownSeconds(currentSeconds);
                }
              }, 1000);
            }
            break;
          }

          case 'session-paused':
            // Host paused the countdown
            setCountdownOverlay(false);
            setSessionStatus('waiting');
            // Reset all players' ready status
            setPlayers(prev =>
              prev.map(p => ({ ...p, ready: false }))
            );
            setCurrentUserReady(false);
            break;

          case 'session-start':
            // Game is starting, navigate to game
            if (quizId) {
              navigate(`/quiz/${quizId}/quiz-game?sessionId=${sessionId}`);
            } else if (topicId) {
              navigate(`/topics/${topicId}/quiz-game?sessionId=${sessionId}`);
            }
            break;

          case 'player-joined': {
            const playerJoinedEvent = event as PlayerJoinedEvent;
            // New player joined
            if (playerJoinedEvent.payload?.players) {
              const players = playerJoinedEvent.payload.players.map((p) => ({
                id: p.id,
                name: p.name,
                score: p.score || 0,
                hearts: p.hearts || 3,
                isHost: p.is_host,
                ready: false,
              }));
              setPlayers(players);
            }
            break;
          }
        }
      }
      // Game events (with 'type' property) are handled elsewhere
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
      client.close();
    };
  }, [
    sessionId,
    sessionStatus,
    navigate,
    currentUserId,
    quizId,
    topicId,
    isAuthenticated,
  ]);

  // Fallback polling for session status
  useEffect(() => {
    if (
      !sessionId ||
      sessionStatus !== 'waiting' ||
      connectionStatus === ConnectionStatus.CONNECTED
    ) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await gameService.getSessionStatus(sessionId);
        setPlayers(status.players.map(p => ({ ...p, ready: false })));
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [sessionId, sessionStatus, connectionStatus]);

  // Handle ready toggle
  const handleReadyToggle = useCallback(async () => {
    if (!sessionId) return;

    try {
      await gameService.toggleReady(sessionId);
      // WebSocket will update the state
    } catch (err) {
      console.error('Failed to toggle ready:', err);
    }
  }, [sessionId]);

  // Handle countdown pause (host only)
  const handlePauseCountdown = useCallback(async () => {
    if (!sessionId || !isHost) return;

    try {
      await gameService.pauseCountdown(sessionId);
      // WebSocket will update the state
    } catch (err) {
      console.error('Failed to pause countdown:', err);
    }
  }, [sessionId, isHost]);

  // Handle early returns for authentication and loading states
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The hook will handle redirection to login
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-800/80 rounded-xl p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Fehler</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/game-modes')}
            className="px-6 py-3 bg-[#FCC822] hover:bg-[#e0b01d] text-gray-900 font-bold rounded-lg transition-colors"
          >
            Zurück zur Spielauswahl
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">Spiellobby</h1>
          <p className="text-gray-400">
            Warte auf andere Spieler und klicke auf "Bereit", um zu starten
          </p>

          {/* Connection status indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === ConnectionStatus.CONNECTED
                  ? 'bg-green-500'
                  : connectionStatus === ConnectionStatus.RECONNECTING
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-400">
              {connectionStatus === ConnectionStatus.CONNECTED
                ? 'Verbunden'
                : connectionStatus === ConnectionStatus.RECONNECTING
                  ? 'Verbindung wird wiederhergestellt...'
                  : 'Nicht verbunden'}
            </span>
          </div>
        </div>

        {/* Players list */}
        <div className="grid gap-4 mb-6">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {player.name}
                    {player.isHost && (
                      <span className="ml-2 text-sm text-[#FCC822]">
                        (Host)
                      </span>
                    )}
                    {player.id === currentUserId && (
                      <span className="ml-2 text-sm text-gray-400">(Du)</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-400">Spieler {index + 1}</p>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-medium ${
                  player.ready
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {player.ready ? 'Bereit' : 'Nicht bereit'}
              </div>
            </div>
          ))}

          {/* Show empty slot if only 1 player */}
          {players.length < 2 && (
            <div className="bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-lg p-6 flex items-center justify-center">
              <p className="text-gray-500">Warte auf weiteren Spieler...</p>
            </div>
          )}
        </div>

        {/* Ready button */}
        <div className="flex gap-4">
          <button
            onClick={handleReadyToggle}
            disabled={players.length < 2}
            className={`flex-1 py-4 rounded-lg font-bold text-lg transition-colors ${
              currentUserReady
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : players.length < 2
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FCC822] hover:bg-[#e0b01d] text-gray-900'
            }`}
          >
            {currentUserReady ? 'Nicht bereit' : 'Bereit'}
          </button>
        </div>

        {/* Host controls during countdown */}
        {isHost && sessionStatus === 'countdown' && (
          <div className="mt-4">
            <button
              onClick={handlePauseCountdown}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-colors"
            >
              Countdown stoppen
            </button>
          </div>
        )}
      </div>

      {/* Countdown overlay */}
      {countdownOverlay && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-8 text-white">
              Spiel startet in
            </h2>
            <div className="text-9xl font-bold text-[#FCC822] animate-pulse">
              {countdownSeconds > 0 ? countdownSeconds : 'GO!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
