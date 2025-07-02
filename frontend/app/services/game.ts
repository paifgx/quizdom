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

// Session metadata for joining an existing session
export interface PlayerMeta {
  id: string;
  name: string;
  score: number;
  hearts: number;
  isHost: boolean;
}

export interface SessionMeta {
  sessionId: string;
  mode: BackendGameMode;
  players: PlayerMeta[];
  currentQuestion: number;
  totalQuestions: number;
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

interface SessionJoinResponse {
  session_id: string;
  mode: string;
  players: Array<{
    id: string;
    name: string;
    score: number;
    hearts: number;
    is_host: boolean;
  }>;
  current_question: number;
  total_questions: number;
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
   * Join an existing game session.
   */
  async joinSession(sessionId: string): Promise<SessionMeta> {
    try {
      const response = await apiClient.post<SessionJoinResponse>(
        `/v1/game/session/${sessionId}/join`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );

      // Convert snake_case to camelCase
      return {
        sessionId: response.session_id,
        mode: response.mode as BackendGameMode,
        players: response.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score,
          hearts: player.hearts,
          isHost: player.is_host
        })),
        currentQuestion: response.current_question,
        totalQuestions: response.total_questions
      };
    } catch (error) {
      console.error('Failed to join session:', error);
      throw new Error('Failed to join game session. It may be full or no longer available.');
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
      console.log(`Fetching all ${totalQuestions} questions for session ${sessionId}`);
      const questions: QuestionResponse[] = [];
      
      if (!sessionId) {
        console.error('Invalid sessionId provided:', sessionId);
        throw new Error('Invalid session ID');
      }
      
      if (!totalQuestions || totalQuestions <= 0) {
        console.error('Invalid totalQuestions:', totalQuestions);
        throw new Error('Invalid total questions count');
      }
      
      // Load questions sequentially if there are issues with parallel loading
      for (let i = 0; i < totalQuestions; i++) {
        try {
          console.log(`Fetching question ${i} for session ${sessionId}`);
          const question = await this.getQuestion(sessionId, i);
          questions.push(question);
          console.log(`Successfully loaded question ${i}:`, question.content.substring(0, 20) + '...');
        } catch (questionError) {
          console.error(`Failed to load question ${i}:`, questionError);
          throw new Error(`Failed to load question ${i}`);
        }
      }
      
      console.log(`Successfully loaded all ${questions.length} questions`);
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