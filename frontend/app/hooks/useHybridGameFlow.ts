/**
 * Hook for managing hybrid game flow.
 * Supports both curated quiz and dynamic topic gameplay.
 */

import { useState, useCallback, useEffect } from 'react';
import { gameApiService } from '../services/game-api';
import type { 
  GameSessionResponse, 
  QuestionResponse,
  SubmitAnswerResponse 
} from '../services/game-api';
import type { GameMode } from '../types/game';

export type GameType = 'quiz' | 'topic';

export interface GameConfig {
  type: GameType;
  mode: GameMode;
  // For quiz games
  quizId?: number;
  // For topic games
  topicId?: number;
  questionCount?: number;
  difficultyMin?: number;
  difficultyMax?: number;
}

interface UseHybridGameFlowReturn {
  // Game state
  session: GameSessionResponse | null;
  currentQuestion: QuestionResponse | null;
  questionIndex: number;
  isLoading: boolean;
  error: string | null;
  
  // Player state
  score: number;
  hearts: number;
  
  // Actions
  startGame: (config: GameConfig) => Promise<void>;
  submitAnswer: (answerId: number) => Promise<SubmitAnswerResponse | null>;
  nextQuestion: () => Promise<void>;
  endGame: () => Promise<void>;
}

export function useHybridGameFlow(): UseHybridGameFlowReturn {
  const [session, setSession] = useState<GameSessionResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);

  const startGame = useCallback(async (config: GameConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let sessionResponse: GameSessionResponse;
      
      if (config.type === 'quiz' && config.quizId) {
        // Start curated quiz game
        sessionResponse = await gameApiService.startQuizGame(
          config.quizId,
          config.mode
        );
      } else if (config.type === 'topic' && config.topicId) {
        // Start dynamic topic game
        sessionResponse = await gameApiService.startTopicGame(
          config.topicId,
          {
            mode: config.mode,
            questionCount: config.questionCount,
            difficultyMin: config.difficultyMin,
            difficultyMax: config.difficultyMax,
          }
        );
      } else {
        throw new Error('Invalid game configuration');
      }
      
      setSession(sessionResponse);
      setQuestionIndex(0);
      setScore(0);
      setHearts(3);
      
      // Load first question
      const firstQuestion = await gameApiService.getQuestion(
        sessionResponse.sessionId,
        0
      );
      setCurrentQuestion(firstQuestion);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answerId: number): Promise<SubmitAnswerResponse | null> => {
    if (!session || !currentQuestion) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await gameApiService.submitAnswer(
        session.sessionId,
        {
          questionId: currentQuestion.questionId,
          answerId,
          answeredAt: Date.now(),
        }
      );
      
      // Update local state
      setScore(response.playerScore);
      setHearts(response.playerHearts);
      
      return response;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, currentQuestion]);

  const nextQuestion = useCallback(async () => {
    if (!session) return;
    
    const nextIndex = questionIndex + 1;
    
    if (nextIndex >= session.totalQuestions) {
      // Game is complete
      await endGame();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const question = await gameApiService.getQuestion(
        session.sessionId,
        nextIndex
      );
      
      setCurrentQuestion(question);
      setQuestionIndex(nextIndex);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load next question');
    } finally {
      setIsLoading(false);
    }
  }, [session, questionIndex, endGame]);

  const endGame = useCallback(async () => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await gameApiService.completeSession(session.sessionId);
      
      // Handle game completion - could emit event or navigate
      console.log('Game completed:', results);
      
      // Reset state
      setSession(null);
      setCurrentQuestion(null);
      setQuestionIndex(0);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete game');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Auto-advance to next question after delay
  useEffect(() => {
    if (!currentQuestion || isLoading) return;
    
    // Could add auto-advance logic here if needed
  }, [currentQuestion, isLoading]);

  return {
    session,
    currentQuestion,
    questionIndex,
    isLoading,
    error,
    score,
    hearts,
    startGame,
    submitAnswer,
    nextQuestion,
    endGame,
  };
} 