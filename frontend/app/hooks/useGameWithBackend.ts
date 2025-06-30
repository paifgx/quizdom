/**
 * Game hook with real-time backend integration.
 * Extends the useGameState hook with backend API calls.
 */

import { useState, useCallback, useEffect } from 'react';
import { useGameState } from './useGameState';
import { gameService } from '../services/game';
import type { Question, PlayerState, GameResult, GameModeId } from '../types/game';

interface UseGameWithBackendProps {
  mode: GameModeId;
  questions: Question[];
  players: PlayerState[];
  sessionId: number;
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
    onGameOver,
    onHeartLoss,
  });

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
        const _response = await gameService.submitAnswer(
          sessionId,
          parseInt(currentQuestion.id),
          backendAnswerId
        );

        // Update local game state with the backend's answer information
        handleLocalAnswer(playerId, answerIndex, answeredAt);

        // Show correct answer after submission
        setIsSubmitting(false);
      } catch (error) {
        console.error('Failed to submit answer:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit answer');
        setIsSubmitting(false);
      }
    },
    [currentQuestion, sessionId, handleLocalAnswer]
  );

  // Complete game session on game over
  useEffect(() => {
    if (gameState.status === 'finished' && sessionId) {
      gameService.completeSession(sessionId)
        .catch(error => console.error('Failed to complete session:', error));
    }
  }, [gameState.status, sessionId]);

  return {
    gameState,
    currentQuestion,
    timeRemaining,
    startGame,
    handleAnswer,
    isSubmitting,
    submitError,
  };
} 