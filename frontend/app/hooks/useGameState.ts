/**
 * Core game state management hook for all game modes.
 * Handles timing, scoring, lives, and game flow logic.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  GameState,
  PlayerState,
  Question,
  ScoreUpdate,
  HeartLossEvent,
  GameOverEvent,
} from '../types/game';

interface UseGameStateProps {
  mode: 'solo' | 'competitive' | 'collaborative';
  questions: Question[];
  players: PlayerState[];
  onGameOver: (event: GameOverEvent) => void;
  onScoreUpdate?: (update: ScoreUpdate) => void;
  onHeartLoss?: (event: HeartLossEvent) => void;
}

// Scoring thresholds in milliseconds
const SCORING_THRESHOLDS = {
  FAST: 3000, // 0-3 seconds = 100 points
  MEDIUM: 6000, // 3-6 seconds = 50 points
};

const POINTS = {
  FAST: 100,
  MEDIUM: 50,
  SLOW: 0,
};

// Time limits per mode in seconds
const TIME_LIMITS = {
  solo: Infinity, // No time limit for solo
  competitive: 10,
  collaborative: 15,
};

// Initial hearts per mode
const INITIAL_HEARTS = {
  solo: 3,
  competitive: 3,
  collaborative: 3, // Team shares 3 hearts
};

// Helper function to check if game should end
const checkGameOver = (
  currentGameState: GameState,
  mode: 'solo' | 'competitive' | 'collaborative'
): boolean => {
  if (mode === 'solo') {
    const player = currentGameState.players[0];
    return player.hearts <= 0;
  } else if (mode === 'competitive') {
    return currentGameState.players.some(p => p.hearts <= 0);
  } else if (mode === 'collaborative') {
    return (currentGameState.teamHearts || 0) <= 0;
  }
  return false;
};

// Helper function to end the game
const endGame = (
  currentGameState: GameState,
  mode: 'solo' | 'competitive' | 'collaborative',
  onGameOver: (event: GameOverEvent) => void,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  setIsTimerRunning: (running: boolean) => void
) => {
  setGameState(prev => ({
    ...prev,
    status: 'finished',
    endTime: Date.now(),
  }));
  setIsTimerRunning(false);

  // Determine result
  let result: 'win' | 'fail' = 'win';
  let score = 0;
  let heartsRemaining = 0;

  if (mode === 'solo') {
    const player = currentGameState.players[0];
    result = player.hearts > 0 ? 'win' : 'fail';
    score = player.score;
    heartsRemaining = player.hearts;
  } else if (mode === 'competitive') {
    const alivePlayers = currentGameState.players.filter(p => p.hearts > 0);
    if (alivePlayers.length === 1) {
      // One player remaining
      result = 'win';
      score = alivePlayers[0].score;
      heartsRemaining = alivePlayers[0].hearts;
      setGameState(prev => ({ ...prev, winner: alivePlayers[0].id }));
    } else {
      // Game ended with questions finished
      const winner = currentGameState.players.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev
      );
      result = 'win';
      score = winner.score;
      heartsRemaining = winner.hearts;
      setGameState(prev => ({ ...prev, winner: winner.id }));
    }
  } else if (mode === 'collaborative') {
    result = (currentGameState.teamHearts || 0) > 0 ? 'win' : 'fail';
    score = currentGameState.teamScore || 0;
    heartsRemaining = currentGameState.teamHearts || 0;
  }

  onGameOver({
    mode,
    result,
    score,
    heartsRemaining,
  });
};

export function useGameState({
  mode,
  questions,
  players: initialPlayers,
  onGameOver,
  onScoreUpdate,
  onHeartLoss,
}: UseGameStateProps) {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    mode,
    status: 'waiting',
    currentQuestionIndex: 0,
    questions,
    players: initialPlayers.map(p => ({
      ...p,
      hearts: mode === 'collaborative' ? 0 : INITIAL_HEARTS[mode],
      score: 0,
    })),
    teamHearts:
      mode === 'collaborative' ? INITIAL_HEARTS.collaborative : undefined,
    teamScore: mode === 'collaborative' ? 0 : undefined,
    timeLimit: TIME_LIMITS[mode],
  });

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMITS[mode]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current question
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  // Calculate score based on response time
  const calculateScore = useCallback((responseTime: number): number => {
    if (responseTime <= SCORING_THRESHOLDS.FAST) {
      return POINTS.FAST;
    } else if (responseTime <= SCORING_THRESHOLDS.MEDIUM) {
      return POINTS.MEDIUM;
    }
    return POINTS.SLOW;
  }, []);

  // Move to next question or end game
  const handleQuestionComplete = useCallback(() => {
    setIsTimerRunning(false);

    setGameState(prevState => {
      // Check for game over conditions
      const shouldEndGame = checkGameOver(prevState, mode);
      if (shouldEndGame) {
        endGame(prevState, mode, onGameOver, setGameState, setIsTimerRunning);
        return prevState;
      }

      // Move to next question
      if (prevState.currentQuestionIndex < prevState.questions.length - 1) {
        setTimeout(() => {
          setGameState(prev => {
            const nextIndex = prev.currentQuestionIndex + 1;
            const updatedQuestions = [...prev.questions];

            // Set timestamp for next question
            if (nextIndex < updatedQuestions.length) {
              updatedQuestions[nextIndex] = {
                ...updatedQuestions[nextIndex],
                showTimestamp: Date.now(),
              };
            }

            return {
              ...prev,
              currentQuestionIndex: nextIndex,
              questions: updatedQuestions,
              players: prev.players.map(p => ({
                ...p,
                hasAnswered: false,
                answerTimestamp: undefined,
                selectedAnswer: undefined,
                isCorrect: undefined,
              })),
            };
          });
          setTimeRemaining(TIME_LIMITS[mode]);
          setIsTimerRunning(true);
        }, 2000); // 2 second delay before next question
      } else {
        // All questions answered
        endGame(prevState, mode, onGameOver, setGameState, setIsTimerRunning);
      }

      return prevState;
    });
  }, [mode, onGameOver]);

  // Start the game
  const startGame = useCallback(() => {
    setGameState(prev => {
      const updatedQuestions = [...prev.questions];
      // Set timestamp for first question
      if (updatedQuestions.length > 0) {
        updatedQuestions[0] = {
          ...updatedQuestions[0],
          showTimestamp: Date.now(),
        };
      }

      return {
        ...prev,
        status: 'playing',
        startTime: Date.now(),
        questions: updatedQuestions,
      };
    });
    setIsTimerRunning(true);
  }, []);

  // Handle answer selection
  const handleAnswer = useCallback(
    (playerId: string, answerIndex: number, answeredAt: number) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player || player.hasAnswered) return;

      const responseTime = answeredAt - currentQuestion.showTimestamp;
      const isCorrect = answerIndex === currentQuestion.correctAnswer;
      const points = isCorrect ? calculateScore(responseTime) : 0;

      setGameState(prev => {
        const updatedPlayers = prev.players.map(p => {
          if (p.id === playerId) {
            return {
              ...p,
              hasAnswered: true,
              answerTimestamp: answeredAt,
              selectedAnswer: answerIndex,
              isCorrect,
              score: p.score + points,
            };
          }
          return p;
        });

        // Handle hearts and scoring based on mode
        const newState = { ...prev, players: updatedPlayers };

        if (mode === 'solo') {
          if (!isCorrect) {
            // Update hearts properly in the newState
            newState.players = newState.players.map(p => {
              if (p.id === playerId) {
                const newHearts = p.hearts - 1;
                onHeartLoss?.({
                  playerId,
                  heartsRemaining: newHearts,
                });
                return { ...p, hearts: newHearts };
              }
              return p;
            });
          }
        } else if (mode === 'competitive') {
          if (!isCorrect) {
            // Update hearts properly in the newState
            newState.players = newState.players.map(p => {
              if (p.id === playerId) {
                const newHearts = p.hearts - 1;
                onHeartLoss?.({
                  playerId,
                  heartsRemaining: newHearts,
                });
                return { ...p, hearts: newHearts };
              }
              return p;
            });
          }
        } else if (mode === 'collaborative') {
          // In collaborative mode, hearts are deducted only after all players answer or time runs out
          newState.teamScore = (newState.teamScore || 0) + points;
        }

        // Emit score update
        if (isCorrect) {
          onScoreUpdate?.({
            playerId,
            points,
            totalScore: updatedPlayers.find(p => p.id === playerId)!.score,
            responseTime,
          });
        }

        return newState;
      });

      // Check if all players have answered
      const allAnswered = gameState.players
        .filter(p => p.id !== playerId)
        .every(p => p.hasAnswered);

      if (allAnswered || mode === 'solo') {
        handleQuestionComplete();
      }
    },
    [
      gameState.players,
      currentQuestion,
      mode,
      calculateScore,
      onScoreUpdate,
      onHeartLoss,
      handleQuestionComplete,
    ]
  );

  // Handle question timeout
  const handleTimeout = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev };

      if (mode === 'collaborative') {
        // Check if team got the answer wrong
        const teamAnswers = prev.players.filter(
          p => p.hasAnswered && p.isCorrect
        );
        if (teamAnswers.length === 0) {
          newState.teamHearts = (newState.teamHearts || 0) - 1;
          onHeartLoss?.({
            isTeamHeart: true,
            heartsRemaining: newState.teamHearts || 0,
          });
        }
      } else {
        // Solo and competitive: players who didn't answer lose a heart
        newState.players = prev.players.map(p => {
          if (!p.hasAnswered && p.hearts > 0) {
            const newHearts = p.hearts - 1;
            onHeartLoss?.({
              playerId: p.id,
              heartsRemaining: newHearts,
            });
            return { ...p, hearts: newHearts, hasAnswered: true };
          }
          return p;
        });
      }

      return newState;
    });

    handleQuestionComplete();
  }, [mode, onHeartLoss, handleQuestionComplete]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 0.1);
      }, 100); // Update every 100ms for smooth countdown
    } else if (isTimerRunning && timeRemaining <= 0) {
      handleTimeout();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, handleTimeout]);

  return {
    gameState,
    currentQuestion,
    timeRemaining,
    isTimerRunning,
    startGame,
    handleAnswer,
  };
}
