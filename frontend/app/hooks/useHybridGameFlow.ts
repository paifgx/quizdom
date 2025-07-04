/**
 * Hook for managing hybrid game flow.
 * Supports both curated quiz and dynamic topic gameplay.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  gameService,
  type SubmitAnswerRequest,
  type BackendGameMode,
} from '../services/game';
import type { GameModeId } from '../types/game';

export type GameType = 'quiz' | 'topic';

export interface GameConfig {
  type: GameType;
  mode: GameModeId;
  // For quiz games
  quizId?: number;
  // For topic games
  topicId?: number;
  questionCount?: number;
  difficultyMin?: number;
  difficultyMax?: number;
}

interface QuestionResponse {
  questionId: number;
  questionNumber: number;
  content: string;
  answers: Array<{
    id: number;
    content: string;
  }>;
  timeLimit: number;
  showTimestamp: number;
}

interface GameSessionResponse {
  sessionId: number;
  mode: BackendGameMode;
  // Either quiz or topic info
  quizId?: number;
  quizTitle?: string;
  topicId?: number;
  topicTitle?: string;
  totalQuestions: number;
  timeLimit?: number;
}

interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswerId: number;
  pointsEarned: number;
  responseTimeMs: number;
  playerScore: number;
  playerHearts: number;
  explanation?: string;
}

interface BackendSessionResponse {
  session_id: number;
  mode: string;
  quiz_id?: number;
  quiz_title?: string;
  topic_id?: number;
  topic_title?: string;
  total_questions: number;
  time_limit?: number;
}

interface BackendQuestionResponse {
  question_id: number;
  question_number: number;
  content: string;
  answers: Array<{
    id: number;
    content: string;
  }>;
  time_limit: number;
  show_timestamp: number;
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
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionResponse | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);

  const startGame = useCallback(async (config: GameConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      let sessionResponse: BackendSessionResponse;

      if (config.type === 'quiz' && config.quizId) {
        // Start curated quiz game
        sessionResponse = await gameService.startQuizGame(
          config.quizId.toString(),
          config.mode
        );
      } else if (config.type === 'topic' && config.topicId) {
        // Start dynamic topic game
        sessionResponse = await gameService.startTopicGame(
          config.topicId.toString(),
          config.mode,
          config.questionCount,
          config.difficultyMin,
          config.difficultyMax
        );
      } else {
        throw new Error('Invalid game configuration');
      }

      // Transform response if needed
      const transformedSession = {
        sessionId: sessionResponse.session_id,
        mode: sessionResponse.mode as BackendGameMode,
        quizId: sessionResponse.quiz_id,
        quizTitle: sessionResponse.quiz_title,
        topicId: sessionResponse.topic_id,
        topicTitle: sessionResponse.topic_title,
        totalQuestions: sessionResponse.total_questions,
        timeLimit: sessionResponse.time_limit,
      };

      setSession(transformedSession);
      setQuestionIndex(0);
      setScore(0);
      setHearts(3);

      // Load first question
      const firstQuestion = (await gameService.getQuestion(
        transformedSession.sessionId,
        0
      )) as BackendQuestionResponse;

      // Transform question if needed
      const transformedQuestion = {
        questionId: firstQuestion.question_id,
        questionNumber: firstQuestion.question_number,
        content: firstQuestion.content,
        answers: firstQuestion.answers,
        timeLimit: firstQuestion.time_limit,
        showTimestamp: firstQuestion.show_timestamp,
      };

      setCurrentQuestion(transformedQuestion);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Fehler beim Starten des Spiels'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(
    async (answerId: number): Promise<SubmitAnswerResponse | null> => {
      if (!session || !currentQuestion) return null;

      setIsLoading(true);
      setError(null);

      try {
        const request: SubmitAnswerRequest = {
          questionId: currentQuestion.questionId,
          answerId,
          answeredAt: Date.now(),
        };

        const response = await gameService.submitAnswerWithRequest(
          session.sessionId,
          request
        );

        // Transform response if needed
        const transformedResponse = {
          isCorrect: response.is_correct,
          correctAnswerId: response.correct_answer_id,
          pointsEarned: response.points_earned,
          responseTimeMs: response.response_time_ms,
          playerScore: response.player_score,
          playerHearts: response.player_hearts,
          explanation: response.explanation,
        };

        // Update local state
        setScore(transformedResponse.playerScore);
        setHearts(transformedResponse.playerHearts);

        return transformedResponse;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Fehler beim Übermitteln der Antwort'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [session, currentQuestion]
  );

  const endGame = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await gameService.completeSession(session.sessionId);

      // Handle game completion - could emit event or navigate
      console.log('Game completed:', results);

      // Reset state
      setSession(null);
      setCurrentQuestion(null);
      setQuestionIndex(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Fehler beim Abschließen des Spiels'
      );
    } finally {
      setIsLoading(false);
    }
  }, [session]);

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
      const question = (await gameService.getQuestion(
        session.sessionId,
        nextIndex
      )) as BackendQuestionResponse;

      // Transform question if needed
      const transformedQuestion = {
        questionId: question.question_id,
        questionNumber: question.question_number,
        content: question.content,
        answers: question.answers,
        timeLimit: question.time_limit,
        showTimestamp: question.show_timestamp,
      };

      setCurrentQuestion(transformedQuestion);
      setQuestionIndex(nextIndex);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Fehler beim Laden der nächsten Frage'
      );
    } finally {
      setIsLoading(false);
    }
  }, [session, questionIndex, endGame]);

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
