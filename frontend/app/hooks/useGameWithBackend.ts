/**
 * Game hook with real-time backend integration.
 * Extends the useGameState hook with backend API calls.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameState } from './useGameState';
import { gameService } from '../services/game';
import { useGameContext } from '../contexts/GameContext';
import { authService } from '../services/auth';
import type {
  Question,
  PlayerState,
  GameResult,
  GameModeId,
} from '../types/game';
import type { AnyGameEvent } from '../services/ws';

interface UseGameWithBackendProps {
  mode: GameModeId;
  questions: Question[];
  players: PlayerState[];
  sessionId: string;
  onGameOver: (result: GameResult) => Promise<void>;
  onHeartLoss?: (event: { playerId?: string; heartsRemaining: number }) => void;
}

export function useGameWithBackend({
  mode,
  questions,
  players,
  sessionId,
  onGameOver,
  onHeartLoss,
}: UseGameWithBackendProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const sessionCompletedRef = useRef(false);
  const lastKnownStateRef = useRef<
    Map<string, { score: number; hearts: number }>
  >(new Map());
  const playerMappingRef = useRef<Map<string, string>>(new Map()); // Maps backend user IDs to frontend player IDs
  // Debug logger to track state changes
  const debugRef = useRef<{
    backendToFrontendMap: Record<string, string>;
    lastUpdate: string;
  }>({
    backendToFrontendMap: {},
    lastUpdate: '',
  });

  // Get the WebSocket client from context for multiplayer
  const { wsClient, updatePlayers } = useGameContext();

  // Use the local game state
  const {
    gameState,
    currentQuestion,
    timeRemaining,
    startGame,
    handleAnswer: handleLocalAnswer,
  } = useGameState({
    mode,
    questions,
    players,
    onGameOver: async result => {
      // Ensure we call the onGameOver callback with the result
      if (onGameOver) {
        await onGameOver(result);
      }
      return Promise.resolve();
    },
    onHeartLoss,
  });

  // Reset waiting state on new question
  useEffect(() => {
    setWaitingForOpponent(false);
  }, [gameState.currentQuestionIndex]);

  // Initialize player mapping for competitive mode
  useEffect(() => {
    if (mode === 'competitive' && sessionId && gameState.players.length >= 2) {
      // Clear existing mapping when session changes
      playerMappingRef.current.clear();
      lastKnownStateRef.current.clear();
    }
  }, [sessionId, mode, gameState.players.length]);

  // WebSocket event handler
  const handleWebSocketEvent = useCallback(
    (event: AnyGameEvent) => {
      console.log('WebSocket event received:', event);

      if ('type' in event) {
        // This is a GameEvent
        switch (event.type) {
          case 'question':
            // Update current question if it's different from local state
            if (gameState.currentQuestionIndex !== event.index) {
              console.log('Question update from server:', event);
              // Reset waiting state when new question arrives
              setWaitingForOpponent(false);
            }
            break;

          case 'answer':
            // Update player scores and status
            console.log('Answer update from server:', event);

            // Track that this player has answered
            // Check if this is competitive mode and both players might have answered
            if (mode === 'competitive') {
              // Both players have answered, stop waiting
              setWaitingForOpponent(false);
            }

            // If this is not our answer, update the other player's state
            if (event.playerId !== players[0].id) {
              // Update other player's score
              handleLocalAnswer(event.playerId, 0, Date.now()); // We don't know the actual answer index
            }
            break;

          case 'complete':
            // Complete the game with final scores
            console.log('Game complete from server:', event);
            setWaitingForOpponent(false);
            break;
        }
      } else if ('event' in event) {
        // This is a WebSocketEvent
        switch (event.event) {
          case 'server-ping':
            // Ignore keep-alive pings
            break;
          case 'session-start':
          case 'player-joined':
          case 'question':
          case 'answer-result':
          case 'session-complete':
            // These are handled by the game logic, log them for debugging
            console.log('Game event from server:', event);
            break;
          default:
            console.warn('Unknown WebSocket event:', event);
        }
      }
    },
    [gameState.currentQuestionIndex, mode, players, handleLocalAnswer]
  );

  // Setup WebSocket listeners for multiplayer
  useEffect(() => {
    if (wsClient && (mode === 'competitive' || mode === 'collaborative')) {
      // Register event handler
      const unsubscribe = wsClient.onMessage(handleWebSocketEvent);

      // Cleanup on unmount
      return () => {
        unsubscribe();
      };
    }
  }, [wsClient, mode, handleWebSocketEvent]);

  // Submit answer to backend
  const handleAnswer = useCallback(
    async (playerId: string, answerIndex: number, answeredAt: number) => {
      if (!currentQuestion || !currentQuestion.answerIds) {
        console.error('Missing question data or answer IDs');
        return;
      }

      try {
        setIsSubmitting(true);
        setSubmitError(null);

        // Get the backend answer ID from the mapping
        const backendAnswerId = currentQuestion.answerIds[answerIndex];

        // Submit to backend
        const response = await gameService.submitAnswer(
          parseInt(sessionId),
          parseInt(currentQuestion.id),
          backendAnswerId
        );

        // Use the backend's response to update the correct answer
        const correctAnswerIndex = currentQuestion.answerIds.findIndex(
          id => id === response.correct_answer_id
        );

        // Update the current question's correct answer so the UI shows it correctly
        if (correctAnswerIndex >= 0 && currentQuestion.correctAnswer === -1) {
          currentQuestion.correctAnswer = correctAnswerIndex;
        }

        // Just pass the basic information to handle local answer
        // The local game state will now use the updated correctAnswer
        console.log('[useGameWithBackend] Calling handleLocalAnswer', {
          playerId,
          answerIndex,
          answeredAt,
          correctAnswerIndex,
          currentQuestion,
        });
        handleLocalAnswer(playerId, answerIndex, answeredAt);

        // Track that we answered (handled by polling now)

        // In multiplayer, check if we need to poll for other player's answer
        if (mode === 'competitive' || mode === 'collaborative') {
          const totalPlayers = mode === 'competitive' ? 2 : players.length;

          // Start polling for other player's answer
          let pollCount = 0;
          const maxPolls = 30; // Poll for max 60 seconds (30 * 2 seconds)

          const pollForOtherPlayers = setInterval(async () => {
            try {
              const sessionStatus =
                await gameService.getSessionStatus(sessionId);

              // Count how many players have answered
              let answeredCount = 0;
              sessionStatus.players.forEach(player => {
                // Check if player has answered by looking at score change or other indicators
                if (
                  player.score > 0 ||
                  sessionStatus.currentQuestion > gameState.currentQuestionIndex
                ) {
                  answeredCount++;
                }
              });

              // If all players have answered or we've moved to next question
              if (
                answeredCount >= totalPlayers ||
                sessionStatus.currentQuestion > gameState.currentQuestionIndex
              ) {
                clearInterval(pollForOtherPlayers);
                setWaitingForOpponent(false);

                // Check if the game should move to next question
                const allPlayersAnswered = answeredCount >= totalPlayers;
                if (
                  allPlayersAnswered &&
                  !gameState.players.every(p => p.hasAnswered)
                ) {
                  // Simulate all players have answered to trigger question progression
                  setTimeout(() => {
                    // This will trigger the question completion check in useGameState
                    gameState.players.forEach(p => {
                      if (!p.hasAnswered) {
                        p.hasAnswered = true;
                      }
                    });
                  }, 1000);
                }
              } else if (pollCount >= maxPolls) {
                // Timeout - stop polling
                clearInterval(pollForOtherPlayers);
                setWaitingForOpponent(false);
              } else {
                // Still waiting
                setWaitingForOpponent(true);
              }

              pollCount++;
            } catch (error) {
              console.error('Failed to poll for other players:', error);
              clearInterval(pollForOtherPlayers);
            }
          }, 2000);
        }

        setIsSubmitting(false);
      } catch (error) {
        console.error('Failed to submit answer:', error);
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to submit answer'
        );
        setIsSubmitting(false);
      }
    },
    [
      currentQuestion,
      sessionId,
      handleLocalAnswer,
      mode,
      players.length,
      gameState,
    ]
  );

  // Complete game session on game over
  useEffect(() => {
    if (
      gameState.status === 'finished' &&
      sessionId &&
      !sessionCompletedRef.current
    ) {
      sessionCompletedRef.current = true;
      gameService
        .completeSession(parseInt(sessionId))
        .catch(error => console.error('Failed to complete session:', error));
    }
  }, [gameState.status, sessionId]);

  // Update players in context when they change in state
  useEffect(() => {
    if (gameState.players.length && updatePlayers) {
      updatePlayers(
        gameState.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score,
          hearts: player.hearts,
          isHost: player.id === 'player1', // Simplified assumption
        }))
      );
    }
  }, [gameState.players, updatePlayers]);

  // Poll for player updates in multiplayer modes
  useEffect(() => {
    if (!sessionId || mode === 'solo') return;

    console.log('Setting up player polling for session:', sessionId);

    // Initialize player mapping on first run
    let isFirstRun = playerMappingRef.current.size === 0;

    const pollInterval = setInterval(async () => {
      try {
        const sessionStatus = await gameService.getSessionStatus(sessionId);
        console.log('Poll status:', sessionStatus);

        // On first run, establish the mapping between frontend and backend players
        if (isFirstRun && sessionStatus.players.length >= 2) {
          console.log(
            'Setting up player mapping, players:',
            sessionStatus.players
          );

          // Get the current user ID to determine which player is "us"
          const currentUser = authService.getUser();
          const currentUserId = currentUser?.id?.toString();

          if (!currentUserId) {
            console.error(
              'Could not determine current user ID for player mapping'
            );
            // Fallback to host-based mapping
            const hostPlayer = sessionStatus.players.find(p => p.isHost);
            const nonHostPlayer = sessionStatus.players.find(p => !p.isHost);

            if (hostPlayer && nonHostPlayer) {
              playerMappingRef.current.set(hostPlayer.id, 'player1');
              playerMappingRef.current.set(nonHostPlayer.id, 'player2');

              debugRef.current.backendToFrontendMap = {
                [hostPlayer.id]: 'player1 (host/left)',
                [nonHostPlayer.id]: 'player2 (guest/right)',
              };

              console.log(
                'Player mapping established (fallback):',
                debugRef.current.backendToFrontendMap
              );

              lastKnownStateRef.current.set('player1', {
                score: hostPlayer.score,
                hearts: hostPlayer.hearts,
              });
              lastKnownStateRef.current.set('player2', {
                score: nonHostPlayer.score,
                hearts: nonHostPlayer.hearts,
              });
            }
          } else {
            // Map based on current user perspective
            // Current user is always player1 (left side), opponent is player2 (right side)
            const currentUserBackendPlayer = sessionStatus.players.find(
              p => p.id === currentUserId
            );
            const opponentBackendPlayer = sessionStatus.players.find(
              p => p.id !== currentUserId
            );

            if (currentUserBackendPlayer && opponentBackendPlayer) {
              // Map backend user IDs to frontend player IDs based on current user perspective
              playerMappingRef.current.set(
                currentUserBackendPlayer.id,
                'player1'
              ); // Current user -> left
              playerMappingRef.current.set(opponentBackendPlayer.id, 'player2'); // Opponent -> right

              // Store the mapping for debugging purposes
              debugRef.current.backendToFrontendMap = {
                [currentUserBackendPlayer.id]: 'player1 (me/left)',
                [opponentBackendPlayer.id]: 'player2 (opponent/right)',
              };

              console.log('Player mapping established (user perspective):', {
                currentUserId,
                mapping: debugRef.current.backendToFrontendMap,
              });

              // Initialize last known states
              lastKnownStateRef.current.set('player1', {
                score: currentUserBackendPlayer.score,
                hearts: currentUserBackendPlayer.hearts,
              });
              lastKnownStateRef.current.set('player2', {
                score: opponentBackendPlayer.score,
                hearts: opponentBackendPlayer.hearts,
              });
            } else {
              console.error('Could not establish player mapping', {
                currentUserId,
                players: sessionStatus.players,
                currentUserBackendPlayer,
                opponentBackendPlayer,
              });
            }
          }

          isFirstRun = false;
        }

        // Track if any player state has changed
        let hasAnyPlayerChanged = false;
        const updatedGameStatePlayers: PlayerState[] = [...gameState.players];

        // Update each backend player's data to the corresponding frontend player
        sessionStatus.players.forEach(backendPlayer => {
          // Get the correct frontend player ID from our mapping
          const frontendPlayerId = playerMappingRef.current.get(
            backendPlayer.id
          );
          if (!frontendPlayerId) {
            console.warn(
              `No mapping found for backend player ID ${backendPlayer.id}`
            );
            return;
          }

          // Find the index of the player in the game state
          const localPlayerIndex = gameState.players.findIndex(
            p => p.id === frontendPlayerId
          );
          if (localPlayerIndex === -1) {
            console.warn(
              `No local player found for frontend ID ${frontendPlayerId}`
            );
            return;
          }

          const localPlayer = gameState.players[localPlayerIndex];
          const lastState = lastKnownStateRef.current.get(frontendPlayerId) || {
            score: 0,
            hearts: 3,
          };

          const hasScoreChanged = backendPlayer.score !== lastState.score;
          const hasHeartsChanged = backendPlayer.hearts !== lastState.hearts;
          const hasChanged = hasScoreChanged || hasHeartsChanged;

          if (hasChanged) {
            hasAnyPlayerChanged = true;

            // Log detailed information to help debug player mapping issues
            console.log(
              `Player update: Backend ID ${backendPlayer.id} -> Frontend ID ${frontendPlayerId} (${backendPlayer.is_host ? 'host' : 'guest'}): score ${lastState.score} -> ${backendPlayer.score}, hearts ${lastState.hearts} -> ${backendPlayer.hearts}`
            );

            debugRef.current.lastUpdate = `Updated ${frontendPlayerId} (${backendPlayer.is_host ? 'host' : 'guest'}) from backend ID ${backendPlayer.id}: score ${lastState.score} -> ${backendPlayer.score}, hearts ${lastState.hearts} -> ${backendPlayer.hearts}`;

            // Update last known state
            lastKnownStateRef.current.set(frontendPlayerId, {
              score: backendPlayer.score,
              hearts: backendPlayer.hearts,
            });

            // Create an updated player object with the new values
            updatedGameStatePlayers[localPlayerIndex] = {
              ...localPlayer,
              score: backendPlayer.score,
              hearts: backendPlayer.hearts,
              hasAnswered: true, // Mark as answered since state changed
            };

            // Trigger heart loss callback if hearts decreased
            if (
              hasHeartsChanged &&
              backendPlayer.hearts < lastState.hearts &&
              onHeartLoss
            ) {
              onHeartLoss({
                playerId: frontendPlayerId,
                heartsRemaining: backendPlayer.hearts,
              });
            }
          }
        });

        // If any player state changed, trigger a single state update with all changes
        if (hasAnyPlayerChanged) {
          // Since handleLocalAnswer updates one player at a time, we need a different approach
          // Let's directly update the context with the correct player states
          if (updatePlayers) {
            const contextPlayers = updatedGameStatePlayers.map(player => ({
              id: player.id,
              name: player.name,
              score: player.score,
              hearts: player.hearts,
              isHost: player.id === 'player1',
            }));

            // Ensure correct order
            const sortedPlayers = contextPlayers.sort((a, b) =>
              a.id === 'player1' ? -1 : b.id === 'player1' ? 1 : 0
            );

            updatePlayers(sortedPlayers);
          }
        }

        // Always update players in context with latest backend data to ensure consistency
        if (updatePlayers && sessionStatus.players.length > 0) {
          // Create a properly typed list of players to update
          const updatedPlayersList = sessionStatus.players
            .map(backendPlayer => {
              const frontendPlayerId = playerMappingRef.current.get(
                backendPlayer.id
              );
              if (!frontendPlayerId) return null;

              return {
                id: frontendPlayerId,
                name: backendPlayer.name,
                score: backendPlayer.score,
                hearts: backendPlayer.hearts,
                isHost: backendPlayer.isHost,
              };
            })
            .filter(
              (
                p
              ): p is {
                id: string;
                name: string;
                score: number;
                hearts: number;
                isHost: boolean;
              } => p !== null
            );

          if (updatedPlayersList.length === 2) {
            // Ensure players are ordered correctly: player1 (host) on the left, player2 (guest) on the right
            const sortedPlayers = updatedPlayersList.sort((a, b) =>
              a.id === 'player1' ? -1 : b.id === 'player1' ? 1 : 0
            );

            // Double-check the sorting to ensure player1 is always first
            if (
              sortedPlayers.length >= 2 &&
              sortedPlayers[0].id !== 'player1'
            ) {
              console.error(
                'Player order is incorrect after sorting!',
                sortedPlayers
              );
              // Force correct order if sorting fails
              sortedPlayers.reverse();
            }

            updatePlayers(sortedPlayers);
          }
        }
      } catch (error) {
        console.error('Failed to poll player updates:', error);
      }
    }, 500); // Poll every 500ms for more responsive updates

    return () => clearInterval(pollInterval);
  }, [
    sessionId,
    mode,
    gameState.players,
    gameState.currentQuestionIndex,
    onHeartLoss,
    handleLocalAnswer,
    updatePlayers,
  ]);

  return {
    gameState,
    currentQuestion,
    timeRemaining,
    startGame,
    handleAnswer,
    isSubmitting,
    submitError,
    waitingForOpponent,
  };
}
