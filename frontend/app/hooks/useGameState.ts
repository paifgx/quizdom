/**
 * Core game state management hook for all game modes.
 *
 * Provides centralized game logic with timing, scoring, and flow control.
 * Handles different game modes: solo, competitive, and collaborative.
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

/**
 * Check if game should end based on current state.
 *
 * Evaluates end conditions for different game modes.
 * Returns true when game termination is required.
 */
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

/**
 * Calculate final game results for game over event.
 *
 * Determines winner, final score, and remaining hearts.
 * Handles different victory conditions per game mode.
 */
function calculateGameResults(
  gameState: GameState,
  mode: 'solo' | 'competitive' | 'collaborative'
) {
  let result: 'win' | 'fail' = 'win';
  let score = 0;
  let heartsRemaining = 0;
  let winner: string | undefined;

  if (mode === 'solo') {
    const player = gameState.players[0];
    result = player.hearts > 0 ? 'win' : 'fail';
    score = player.score;
    heartsRemaining = player.hearts;
  } else if (mode === 'competitive') {
    const alivePlayers = gameState.players.filter(p => p.hearts > 0);
    if (alivePlayers.length === 1) {
      result = 'win';
      score = alivePlayers[0].score;
      heartsRemaining = alivePlayers[0].hearts;
      winner = alivePlayers[0].id;
    } else {
      const topPlayer = gameState.players.reduce((prev, curr) =>
        curr.score > prev.score ? curr : prev
      );
      result = 'win';
      score = topPlayer.score;
      heartsRemaining = topPlayer.hearts;
      winner = topPlayer.id;
    }
  } else if (mode === 'collaborative') {
    result = (gameState.teamHearts || 0) > 0 ? 'win' : 'fail';
    score = gameState.teamScore || 0;
    heartsRemaining = gameState.teamHearts || 0;
  }

  return { result, score, heartsRemaining, winner };
}

/**
 * End the game and trigger game over event.
 *
 * Calculates final results and notifies parent component.
 * Updates game state to finished status.
 */
const endGame = (
  currentGameState: GameState,
  mode: 'solo' | 'competitive' | 'collaborative',
  onGameOver: (event: GameOverEvent) => void,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  setIsTimerRunning: (running: boolean) => void
) => {
  const { result, score, heartsRemaining, winner } = calculateGameResults(
    currentGameState,
    mode
  );

  setGameState(prev => ({
    ...prev,
    status: 'finished',
    endTime: Date.now(),
    winner,
  }));
  setIsTimerRunning(false);

  onGameOver({
    mode,
    result,
    score,
    heartsRemaining,
  });
};

/**
 * Calculate score based on response time.
 *
 * Awards points based on how quickly player answered.
 * Implements tiered scoring system for engagement.
 */
function calculateScore(responseTime: number): number {
  if (responseTime <= SCORING_THRESHOLDS.FAST) {
    return POINTS.FAST;
  } else if (responseTime <= SCORING_THRESHOLDS.MEDIUM) {
    return POINTS.MEDIUM;
  }
  return POINTS.SLOW;
}

/**
 * Handle heart loss for different game modes.
 *
 * Updates hearts correctly based on mode and triggers callbacks.
 * Manages both individual and team heart systems.
 */
function handleHeartLoss(
  gameState: GameState,
  mode: 'solo' | 'competitive' | 'collaborative',
  playerId: string,
  onHeartLoss?: (event: HeartLossEvent) => void
): GameState {
  if (mode === 'solo' || mode === 'competitive') {
    const updatedPlayers = gameState.players.map(p => {
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
    return { ...gameState, players: updatedPlayers };
  } else if (mode === 'collaborative') {
    const newTeamHearts = (gameState.teamHearts || 0) - 1;
    onHeartLoss?.({
      isTeamHeart: true,
      heartsRemaining: newTeamHearts,
    });
    return { ...gameState, teamHearts: newTeamHearts };
  }
  return gameState;
}

/**
 * Process player answer and update game state.
 *
 * Handles scoring, heart management, and state updates.
 * Manages different game mode behaviors for answers.
 */
function processPlayerAnswer(
  gameState: GameState,
  playerId: string,
  answerIndex: number,
  answeredAt: number,
  currentQuestion: Question,
  mode: 'solo' | 'competitive' | 'collaborative',
  onScoreUpdate?: (update: ScoreUpdate) => void,
  onHeartLoss?: (event: HeartLossEvent) => void
): GameState {
  const responseTime = answeredAt - currentQuestion.showTimestamp;
  const isCorrect = answerIndex === currentQuestion.correctAnswer;
  const points = isCorrect ? calculateScore(responseTime) : 0;

  let newState = { ...gameState };

  newState.players = newState.players.map(p => {
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

  if (mode === 'collaborative') {
    newState.teamScore = (newState.teamScore || 0) + points;
  }

  if (!isCorrect) {
    newState = handleHeartLoss(newState, mode, playerId, onHeartLoss);
  }

  if (isCorrect) {
    onScoreUpdate?.({
      playerId,
      points,
      totalScore: newState.players.find(p => p.id === playerId)!.score,
      responseTime,
    });
  }

  return newState;
}

/**
 * Move to next question or end game.
 *
 * Handles question progression and game completion logic.
 * Manages timing between questions for better UX.
 */
function useQuestionProgression(
  gameState: GameState,
  mode: 'solo' | 'competitive' | 'collaborative',
  onGameOver: (event: GameOverEvent) => void,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  setIsTimerRunning: (running: boolean) => void,
  setTimeRemaining: (time: number) => void
) {
  const isProgressingRef = useRef(false);

  const handleQuestionComplete = useCallback(() => {
    console.log('[useGameState] handleQuestionComplete called');

    // Prevent multiple simultaneous progressions
    if (isProgressingRef.current) {
      console.log(
        '[useGameState] Already progressing to next question, ignoring duplicate call'
      );
      return;
    }

    isProgressingRef.current = true;
    setIsTimerRunning(false);

    setGameState(prevState => {
      console.log('[useGameState] handleQuestionComplete - current state:', {
        currentQuestionIndex: prevState.currentQuestionIndex,
        totalQuestions: prevState.questions.length,
        status: prevState.status,
      });

      const shouldEndGame = checkGameOver(prevState, mode);
      if (shouldEndGame) {
        console.log('[useGameState] Game should end');
        endGame(prevState, mode, onGameOver, setGameState, setIsTimerRunning);
        isProgressingRef.current = false;
        return prevState;
      }

      if (prevState.currentQuestionIndex < prevState.questions.length - 1) {
        console.log('[useGameState] Moving to next question in 2 seconds', {
          currentIndex: prevState.currentQuestionIndex,
          totalQuestions: prevState.questions.length,
          willMoveTo: prevState.currentQuestionIndex + 1,
        });
        setTimeout(() => {
          console.log('[useGameState] Timeout fired, updating state now');
          setGameState(prev => {
            // Check if we've already progressed past this point
            if (prev.currentQuestionIndex !== prevState.currentQuestionIndex) {
              console.log(
                '[useGameState] Question index already changed, skipping update'
              );
              isProgressingRef.current = false;
              return prev;
            }

            const nextIndex = prev.currentQuestionIndex + 1;
            console.log(
              '[useGameState] Inside setState - Setting next question index:',
              {
                currentIndex: prev.currentQuestionIndex,
                nextIndex,
                totalQuestions: prev.questions.length,
              }
            );
            const updatedQuestions = [...prev.questions];

            if (nextIndex < updatedQuestions.length) {
              updatedQuestions[nextIndex] = {
                ...updatedQuestions[nextIndex],
                showTimestamp: Date.now(),
              };
            }

            const newState = {
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
            console.log('[useGameState] Returning new state:', {
              oldIndex: prev.currentQuestionIndex,
              newIndex: newState.currentQuestionIndex,
            });
            // Reset the progressing flag after successful update
            isProgressingRef.current = false;
            return newState;
          });
          setTimeRemaining(TIME_LIMITS[mode]);
          setIsTimerRunning(true);
        }, 2000);
      } else {
        endGame(prevState, mode, onGameOver, setGameState, setIsTimerRunning);
        isProgressingRef.current = false;
      }

      return prevState;
    });
  }, [mode, onGameOver, setGameState, setIsTimerRunning, setTimeRemaining]);

  return { handleQuestionComplete };
}

/**
 * Main game state management hook.
 *
 * Orchestrates all game mechanics and state updates.
 * Provides clean interface for game components.
 */
export function useGameState({
  mode,
  questions,
  players: initialPlayers,
  onGameOver,
  onScoreUpdate,
  onHeartLoss,
}: UseGameStateProps) {
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

  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMITS[mode]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  const { handleQuestionComplete } = useQuestionProgression(
    gameState,
    mode,
    onGameOver,
    setGameState,
    setIsTimerRunning,
    setTimeRemaining
  );

  const startGame = useCallback(() => {
    setGameState(prev => {
      const updatedQuestions = [...prev.questions];
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

  const isProcessingAnswerRef = useRef(false);

  const handleAnswer = useCallback(
    (playerId: string, answerIndex: number, answeredAt: number) => {
      // Prevent multiple simultaneous answer processing
      if (isProcessingAnswerRef.current) {
        console.log(
          '[useGameState] Already processing answer, ignoring duplicate call'
        );
        return;
      }

      const player = gameState.players.find(p => p.id === playerId);
      if (!player || player.hasAnswered) {
        console.log('[useGameState] Player not found or already answered', {
          playerId,
          hasAnswered: player?.hasAnswered,
        });
        return;
      }

      isProcessingAnswerRef.current = true;

      setGameState(prev => {
        // Double-check inside setState to ensure we haven't already processed
        const currentPlayer = prev.players.find(p => p.id === playerId);
        if (!currentPlayer || currentPlayer.hasAnswered) {
          console.log(
            '[useGameState] Player already answered (inside setState)'
          );
          isProcessingAnswerRef.current = false;
          return prev;
        }

        const newState = processPlayerAnswer(
          prev,
          playerId,
          answerIndex,
          answeredAt,
          currentQuestion,
          mode,
          onScoreUpdate,
          onHeartLoss
        );

        const allAnswered = newState.players
          .filter(p => p.id !== playerId)
          .every(p => p.hasAnswered);

        console.log('[useGameState] handleAnswer check:', {
          mode,
          playerId,
          allAnswered,
          shouldProgress: allAnswered || mode === 'solo',
          players: newState.players.map(p => ({
            id: p.id,
            hasAnswered: p.hasAnswered,
          })),
        });

        if (allAnswered || mode === 'solo') {
          setTimeout(() => {
            console.log('[useGameState] Calling handleQuestionComplete');
            handleQuestionComplete();
            // Reset the processing flag after question complete
            setTimeout(() => {
              isProcessingAnswerRef.current = false;
            }, 100);
          }, 0);
        } else {
          // Reset immediately if not progressing
          isProcessingAnswerRef.current = false;
        }

        return newState;
      });
    },
    [
      gameState.players,
      currentQuestion,
      mode,
      onScoreUpdate,
      onHeartLoss,
      handleQuestionComplete,
    ]
  );

  const handleTimeout = useCallback(() => {
    setGameState(prev => {
      let newState = { ...prev };

      if (mode === 'collaborative') {
        const teamAnswers = prev.players.filter(
          p => p.hasAnswered && p.isCorrect
        );
        if (teamAnswers.length === 0) {
          newState = handleHeartLoss(newState, mode, '', onHeartLoss);
        }
      } else {
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

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 0.1);
      }, 100);
    } else if (isTimerRunning && timeRemaining <= 0) {
      handleTimeout();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, handleTimeout]);

  // Function to update player stats from external sources (e.g., backend polling)
  const updatePlayerStats = useCallback(
    (playerId: string, score: number, hearts: number) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p =>
          p.id === playerId
            ? {
                ...p,
                score,
                hearts,
              }
            : p
        ),
      }));
    },
    []
  );

  return {
    gameState,
    currentQuestion,
    timeRemaining,
    isTimerRunning,
    startGame,
    handleAnswer,
    updatePlayerStats,
  };
}
