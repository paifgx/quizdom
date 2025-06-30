/**
 * Game API service for hybrid quiz/topic gameplay.
 * Supports both curated quizzes and dynamic topic-based games.
 */

import { apiClient } from '../api/client';
import type { GameMode } from '../types/game';

export interface GameSessionCreate {
  mode: GameMode;
  // For random games
  questionCount?: number;
  difficultyMin?: number;
  difficultyMax?: number;
}

export interface GameSessionResponse {
  sessionId: number;
  mode: GameMode;
  // Either quiz or topic info
  quizId?: number;
  quizTitle?: string;
  topicId?: number;
  topicTitle?: string;
  totalQuestions: number;
  timeLimit?: number;
}

export interface QuestionResponse {
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

export interface SubmitAnswerRequest {
  questionId: number;
  answerId: number;
  answeredAt: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswerId: number;
  pointsEarned: number;
  responseTimeMs: number;
  playerScore: number;
  playerHearts: number;
  explanation?: string;
}

export interface GameResultResponse {
  sessionId: number;
  mode: GameMode;
  result: 'win' | 'fail';
  finalScore: number;
  heartsRemaining: number;
  questionsAnswered: number;
  correctAnswers: number;
  totalTimeSeconds: number;
  rank?: number;
  percentile?: number;
}

class GameApiService {
  /**
   * Start a game with a curated quiz.
   */
  async startQuizGame(
    quizId: number,
    mode: GameMode
  ): Promise<GameSessionResponse> {
    const response = await apiClient.post<{
      session_id: number;
      mode: GameMode;
      quiz_id: number;
      quiz_title: string;
      total_questions: number;
      time_limit?: number;
    }>(
      `/v1/game/quiz/${quizId}/start`,
      { mode }
    );
    
    // Transform snake_case to camelCase
    return {
      sessionId: response.session_id,
      mode: response.mode,
      quizId: response.quiz_id,
      quizTitle: response.quiz_title,
      totalQuestions: response.total_questions,
      timeLimit: response.time_limit,
    };
  }

  /**
   * Start a game with random questions from a topic.
   */
  async startTopicGame(
    topicId: number,
    options: GameSessionCreate
  ): Promise<GameSessionResponse> {
    const response = await apiClient.post<{
      session_id: number;
      mode: GameMode;
      topic_id: number;
      topic_title: string;
      total_questions: number;
      time_limit?: number;
    }>(
      `/v1/game/topic/${topicId}/random`,
      {
        mode: options.mode,
        question_count: options.questionCount,
        difficulty_min: options.difficultyMin,
        difficulty_max: options.difficultyMax,
      }
    );
    
    // Transform snake_case to camelCase
    return {
      sessionId: response.session_id,
      mode: response.mode,
      topicId: response.topic_id,
      topicTitle: response.topic_title,
      totalQuestions: response.total_questions,
      timeLimit: response.time_limit,
    };
  }

  /**
   * Get the next question in the game session.
   */
  async getQuestion(
    sessionId: number,
    questionIndex: number
  ): Promise<QuestionResponse> {
    const response = await apiClient.get<{
      question_id: number;
      question_number: number;
      content: string;
      answers: Array<{
        id: number;
        content: string;
      }>;
      time_limit: number;
      show_timestamp: number;
    }>(
      `/v1/game/session/${sessionId}/question/${questionIndex}`
    );
    
    return {
      questionId: response.question_id,
      questionNumber: response.question_number,
      content: response.content,
      answers: response.answers,
      timeLimit: response.time_limit,
      showTimestamp: response.show_timestamp,
    };
  }

  /**
   * Submit an answer to a question.
   */
  async submitAnswer(
    sessionId: number,
    answer: SubmitAnswerRequest
  ): Promise<SubmitAnswerResponse> {
    const response = await apiClient.post<{
      is_correct: boolean;
      correct_answer_id: number;
      points_earned: number;
      response_time_ms: number;
      player_score: number;
      player_hearts: number;
      explanation?: string;
    }>(
      `/v1/game/session/${sessionId}/answer`,
      {
        question_id: answer.questionId,
        answer_id: answer.answerId,
        answered_at: answer.answeredAt,
      }
    );
    
    return {
      isCorrect: response.is_correct,
      correctAnswerId: response.correct_answer_id,
      pointsEarned: response.points_earned,
      responseTimeMs: response.response_time_ms,
      playerScore: response.player_score,
      playerHearts: response.player_hearts,
      explanation: response.explanation,
    };
  }

  /**
   * Complete a game session and get results.
   */
  async completeSession(sessionId: number): Promise<GameResultResponse> {
    const response = await apiClient.post<{
      session_id: number;
      mode: GameMode;
      result: 'win' | 'fail';
      final_score: number;
      hearts_remaining: number;
      questions_answered: number;
      correct_answers: number;
      total_time_seconds: number;
      rank?: number;
      percentile?: number;
    }>(
      `/v1/game/session/${sessionId}/complete`,
      {}
    );
    
    return {
      sessionId: response.session_id,
      mode: response.mode,
      result: response.result,
      finalScore: response.final_score,
      heartsRemaining: response.hearts_remaining,
      questionsAnswered: response.questions_answered,
      correctAnswers: response.correct_answers,
      totalTimeSeconds: response.total_time_seconds,
      rank: response.rank,
      percentile: response.percentile,
    };
  }

  /**
   * Get published quizzes for a topic.
   */
  async getPublishedQuizzes(topicId?: number): Promise<Array<{
    id: number;
    title: string;
    description?: string;
    questionCount: number;
    difficulty: number;
    playCount: number;
  }>> {
    const params = topicId ? `?topic_id=${topicId}` : '';
    const response = await apiClient.get<Array<{
      id: number;
      title: string;
      description?: string;
      question_count: number;
      difficulty: number;
      play_count: number;
    }>>(
      `/v1/admin/quizzes/published${params}`
    );
    
    return response.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.question_count,
      difficulty: quiz.difficulty,
      playCount: quiz.play_count,
    }));
  }
}

export const gameApiService = new GameApiService(); 