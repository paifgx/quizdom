/**
 * Game hook with real-time backend integration.
 * Extends the useGameState hook with backend API calls.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameState } from './useGameState';
import { gameService } from '../services/game';
import { useGameContext } from '../contexts/GameContext';
import type { Question, PlayerState, GameResult, GameModeId } from '../types/game';
import type { GameEvent } from '../services/ws';

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
    onGameOver: async (result) => {
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



  // WebSocket event handler
  const handleWebSocketEvent = useCallback((event: GameEvent) => {
    console.log('WebSocket event received:', event);
    
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
        
      default:
        console.warn('Unknown WebSocket event:', event);
    }
  }, [gameState.currentQuestionIndex, mode, players, handleLocalAnswer]);

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
              const sessionStatus = await gameService.getSessionStatus(sessionId);
              
              // Count how many players have answered
              let answeredCount = 0;
              sessionStatus.players.forEach((player: any) => {
                // Check if player has answered by looking at score change or other indicators
                if (player.score > 0 || sessionStatus.currentQuestion > gameState.currentQuestionIndex) {
                  answeredCount++;
                }
              });
              
              // If all players have answered or we've moved to next question
              if (answeredCount >= totalPlayers || sessionStatus.currentQuestion > gameState.currentQuestionIndex) {
                clearInterval(pollForOtherPlayers);
                setWaitingForOpponent(false);
                
                // Check if the game should move to next question
                const allPlayersAnswered = answeredCount >= totalPlayers;
                if (allPlayersAnswered && !gameState.players.every(p => p.hasAnswered)) {
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
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit answer');
        setIsSubmitting(false);
      }
    },
    [currentQuestion, sessionId, handleLocalAnswer, mode, players.length, gameState]
  );

  // Complete game session on game over
  useEffect(() => {
    if (gameState.status === 'finished' && sessionId && !sessionCompletedRef.current) {
      sessionCompletedRef.current = true;
      gameService.completeSession(parseInt(sessionId))
        .catch(error => console.error('Failed to complete session:', error));
    }
  }, [gameState.status, sessionId]);

  // Update players in context when they change in state
  useEffect(() => {
    if (gameState.players.length && updatePlayers) {
      updatePlayers(gameState.players.map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        hearts: player.hearts,
        isHost: player.id === 'player1', // Simplified assumption
      })));
    }
  }, [gameState.players, updatePlayers]);

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