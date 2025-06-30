/**
 * Game service for real-time quiz gameplay.
 * Handles all game-related API calls to the backend.
 */

import { apiClient } from '../api/client';
import { authService } from './auth';
import type { GameModeId } from '../types/game';

// Backend GameMode enum values
export type BackendGameMode = 'solo' | 'comp' | 'collab';

// Convert frontend game mode to backend format
function toBackendGameMode(mode: GameModeId): BackendGameMode {
  switch (mode) {
    case 'solo':
      return 'solo';
    case 'competitive':
      return 'comp';
    case 'collaborative':
      return 'collab';
    default:
      throw new Error(`Unknown game mode: ${mode}`);
  }
}

// Backend response types
interface GameSessionResponse {
  session_id: number;
  mode: string;
  quiz_id?: number;
  quiz_title?: string;
  topic_id?: number;
  topic_title?: string;
  total_questions: number;
  time_limit?: number;
}

interface AnswerOption {
  id: number;
  content: string;
}

interface QuestionResponse {
  question_id: number;
  question_number: number;
  content: string;
  answers: AnswerOption[];
  time_limit: number;
  show_timestamp: number;
}

interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer_id: number;
  points_earned: number;
  response_time_ms: number;
  player_score: number;
  player_hearts: number;
  explanation?: string;
}

interface GameResultResponse {
  session_id: number;
  mode: string;
  result: string;
  final_score: number;
  hearts_remaining: number;
  questions_answered: number;
  correct_answers: number;
  total_time_seconds: number;
  rank?: number;
  percentile?: number;
}

class GameService {
  /**
   * Get authorization headers for requests.
   */
  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Start a new game session with random questions from a topic.
   */
  async startTopicGame(
    topicId: string,
    mode: GameModeId,
    questionCount: number = 10,
    difficultyMin?: number,
    difficultyMax?: number
  ): Promise<GameSessionResponse> {
    try {
      const response = await apiClient.post<GameSessionResponse>(
        `/v1/game/topic/${topicId}/random`,
        {
          mode: toBackendGameMode(mode),
          question_count: questionCount,
          difficulty_min: difficultyMin,
          difficulty_max: difficultyMax,
        },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to start topic game:', error);
      throw new Error('Failed to start game. Please try again.');
    }
  }

  /**
   * Start a new game session with a curated quiz.
   */
  async startQuizGame(quizId: string, mode: GameModeId): Promise<GameSessionResponse> {
    try {
      const response = await apiClient.post<GameSessionResponse>(
        `/v1/game/quiz/${quizId}/start`,
        { mode: toBackendGameMode(mode) },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to start quiz game:', error);
      throw new Error('Failed to start game. Please try again.');
    }
  }

  /**
   * Get a specific question from the game session.
   */
  async getQuestion(
    sessionId: number,
    questionIndex: number
  ): Promise<QuestionResponse> {
    try {
      const response = await apiClient.get<QuestionResponse>(
        `/v1/game/session/${sessionId}/question/${questionIndex}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to get question:', error);
      throw new Error('Failed to load question. Please try again.');
    }
  }

  /**
   * Submit an answer for a question.
   */
  async submitAnswer(
    sessionId: number,
    questionId: number,
    answerId: number
  ): Promise<SubmitAnswerResponse> {
    try {
      const response = await apiClient.post<SubmitAnswerResponse>(
        `/v1/game/session/${sessionId}/answer`,
        {
          question_id: questionId,
          answer_id: answerId,
          answered_at: Date.now(),
        },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw new Error('Failed to submit answer. Please try again.');
    }
  }

  /**
   * Complete a game session and get results.
   */
  async completeSession(sessionId: number): Promise<GameResultResponse> {
    try {
      const response = await apiClient.post<GameResultResponse>(
        `/v1/game/session/${sessionId}/complete`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw new Error('Failed to complete game. Please try again.');
    }
  }

  /**
   * Get all questions for a session at once (for offline play).
   * This loads all questions upfront to avoid network delays during gameplay.
   */
  async getAllQuestionsForSession(
    sessionId: number,
    totalQuestions: number
  ): Promise<QuestionResponse[]> {
    try {
      const questions: QuestionResponse[] = [];
      
      // Load all questions in parallel for better performance
      const promises = Array.from({ length: totalQuestions }, (_, i) =>
        this.getQuestion(sessionId, i)
      );
      
      const results = await Promise.allSettled(promises);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          questions.push(result.value);
        } else {
          console.error('Failed to load question:', result.reason);
          throw new Error('Failed to load all questions');
        }
      }
      
      return questions;
    } catch (error) {
      console.error('Failed to load questions:', error);
      throw new Error('Failed to load game questions. Please try again.');
    }
  }
}

// Export singleton instance
export const gameService = new GameService();
export { GameService };
export default gameService; 