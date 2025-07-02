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

  // WebSocket event handler
  const handleWebSocketEvent = useCallback((event: GameEvent) => {
    let _updatedPlayers;
    
    switch (event.type) {
      case 'question':
        // Update current question if it's different from local state
        if (gameState.currentQuestionIndex !== event.index) {
          console.log('Question update from server:', event);
          // Force update through gameState directly in a future update
        }
        setWaitingForOpponent(false);
        break;
        
      case 'answer':
        // Update player scores and status
        console.log('Answer update from server:', event);
        // Update player state based on server data
        _updatedPlayers = gameState.players.map(player => {
          if (player.id === event.playerId) {
            return {
              ...player,
              score: event.score,
              isCorrect: event.isCorrect,
              hasAnswered: true
            };
          }
          return player;
        });
        
        // We'll need to implement our own state update method in a future enhancement
        break;
        
      case 'complete':
        // Complete the game with final scores
        console.log('Game complete from server:', event);
        // Handle game completion in a future enhancement
        break;
        
      default:
        console.warn('Unknown WebSocket event:', event);
    }
  }, [gameState]);

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

        // In multiplayer, set waiting state if we answered but others haven't
        if (mode === 'competitive' || mode === 'collaborative') {
          setWaitingForOpponent(true);
        }

        setIsSubmitting(false);
      } catch (error) {
        console.error('Failed to submit answer:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit answer');
        setIsSubmitting(false);
      }
    },
    [currentQuestion, sessionId, handleLocalAnswer, mode]
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