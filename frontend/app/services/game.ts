/**
 * Game service for real-time quiz gameplay.
 * Handles all game-related API calls to the backend.
 */

import { apiClient } from '../api/client';
import { authService } from './auth';
import type { GameModeId } from '../types/game';

// Backend GameMode enum values
export type BackendGameMode = 'solo' | 'comp' | 'collab';

// Session metadata for joining an existing session
export interface PlayerMeta {
  id: string;
  name: string;
  score: number;
  hearts: number;
  isHost: boolean;
  is_host?: boolean; // For compatibility with backend responses
}

export interface SessionMeta {
  sessionId: string;
  mode: BackendGameMode;
  players: PlayerMeta[];
  currentQuestion: number;
  totalQuestions: number;
  quizId?: number;
  topicId?: number;
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

export interface SubmitAnswerRequest {
  questionId: number;
  answerId: number;
  answeredAt: number;
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
  quiz_id?: number;
  topic_id?: number;
}

class GameService {
  /**
   * Convert frontend game mode to backend format
   */
  private toBackendGameMode(mode: GameModeId): BackendGameMode {
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

  /**
   * Get authorization headers for requests.
   */
  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Kein Authentifizierungstoken gefunden');
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
          mode: this.toBackendGameMode(mode),
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
      throw new Error(
        'Fehler beim Starten des Spiels. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Start a new game session with a curated quiz.
   */
  async startQuizGame(
    quizId: string,
    mode: GameModeId
  ): Promise<GameSessionResponse> {
    try {
      const response = await apiClient.post<GameSessionResponse>(
        `/v1/game/quiz/${quizId}/start`,
        { mode: this.toBackendGameMode(mode) },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to start quiz game:', error);
      throw new Error(
        'Fehler beim Starten des Spiels. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Join an existing game session.
   */
  async joinSession(sessionId: string): Promise<SessionMeta> {
    try {
      const sessionIdInt = parseInt(sessionId);
      if (isNaN(sessionIdInt)) {
        throw new Error('Ungültige Sitzungs-ID');
      }

      const response = await apiClient.post<SessionJoinResponse>(
        `/v1/game/session/${sessionIdInt}/join`,
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
          isHost: player.is_host,
        })),
        currentQuestion: response.current_question,
        totalQuestions: response.total_questions,
        quizId: response.quiz_id,
        topicId: response.topic_id,
      };
    } catch (error) {
      console.error('Failed to join session:', error);
      throw new Error(
        'Fehler beim Beitreten zur Spielsitzung. Sie könnte voll oder nicht mehr verfügbar sein.'
      );
    }
  }

  /**
   * Get the status of a game session.
   */
  async getSessionStatus(sessionId: string): Promise<{
    sessionId: number;
    status: string;
    mode: string;
    players: PlayerMeta[];
    currentQuestion: number;
    totalQuestions: number;
    playerCount: number;
  }> {
    try {
      // Ensure sessionId is parsed as integer for backend
      const sessionIdInt = parseInt(sessionId);
      if (isNaN(sessionIdInt)) {
        throw new Error('Ungültige Sitzungs-ID');
      }

      const response = await apiClient.get<{
        session_id: number;
        status: string;
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
        player_count: number;
      }>(`/v1/game/session/${sessionIdInt}/status`, {
        headers: this.getAuthHeaders(),
      });

      // Convert snake_case to camelCase
      return {
        sessionId: response.session_id,
        status: response.status,
        mode: response.mode,
        players: response.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score,
          hearts: player.hearts,
          isHost: player.is_host,
        })),
        currentQuestion: response.current_question,
        totalQuestions: response.total_questions,
        playerCount: response.player_count,
      };
    } catch (error) {
      console.error('Failed to get session status:', error);
      throw new Error('Fehler beim Abrufen des Sitzungsstatus.');
    }
  }

  /**
   * Toggle ready status for a player in the lobby.
   */
  async toggleReady(sessionId: string): Promise<{
    ready: boolean;
    players: PlayerMeta[];
  }> {
    try {
      const sessionIdInt = parseInt(sessionId);
      if (isNaN(sessionIdInt)) {
        throw new Error('Ungültige Sitzungs-ID');
      }

      const response = await apiClient.put<{
        ready: boolean;
        players: Array<{
          id: string;
          name: string;
          ready: boolean;
          is_host: boolean;
        }>;
      }>(
        `/v1/game/session/${sessionIdInt}/ready`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );

      return {
        ready: response.ready,
        players: response.players.map(player => ({
          id: player.id,
          name: player.name,
          score: 0,
          hearts: 3,
          isHost: player.is_host,
        })),
      };
    } catch (error) {
      console.error('Failed to toggle ready:', error);
      throw new Error('Fehler beim Setzen des Bereit-Status.');
    }
  }

  /**
   * Pause the countdown (host only).
   */
  async pauseCountdown(sessionId: string): Promise<{
    success: boolean;
    status: string;
  }> {
    try {
      const sessionIdInt = parseInt(sessionId);
      if (isNaN(sessionIdInt)) {
        throw new Error('Ungültige Sitzungs-ID');
      }

      const response = await apiClient.post<{
        success: boolean;
        status: string;
      }>(
        `/v1/game/session/${sessionIdInt}/pause`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to pause countdown:', error);
      throw new Error('Fehler beim Stoppen des Countdowns.');
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
      throw new Error(
        'Fehler beim Laden der Frage. Bitte versuchen Sie es erneut.'
      );
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
      throw new Error(
        'Fehler beim Übermitteln der Antwort. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Submit an answer for a question using the gameApiService interface.
   */
  async submitAnswerWithRequest(
    sessionId: number,
    answer: SubmitAnswerRequest
  ): Promise<SubmitAnswerResponse> {
    try {
      const response = await apiClient.post<SubmitAnswerResponse>(
        `/v1/game/session/${sessionId}/answer`,
        {
          question_id: answer.questionId,
          answer_id: answer.answerId,
          answered_at: answer.answeredAt,
        },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw new Error(
        'Fehler beim Übermitteln der Antwort. Bitte versuchen Sie es erneut.'
      );
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
      throw new Error(
        'Fehler beim Abschließen des Spiels. Bitte versuchen Sie es erneut.'
      );
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
      console.log(
        `Fetching all ${totalQuestions} questions for session ${sessionId}`
      );

      if (!sessionId) {
        console.error('Invalid sessionId provided:', sessionId);
        throw new Error('Ungültige Sitzungs-ID');
      }

      if (!totalQuestions || totalQuestions <= 0) {
        console.error('Invalid totalQuestions:', totalQuestions);
        throw new Error('Ungültige Anzahl von Fragen');
      }

      // Create an array of promises for parallel loading
      const questionPromises = Array.from(
        { length: totalQuestions },
        (_, i) => {
          return this.getQuestion(sessionId, i).catch(error => {
            console.error(`Failed to load question ${i}:`, error);
            throw new Error(`Fehler beim Laden der Frage ${i}`);
          });
        }
      );

      // Wait for all questions to load in parallel
      const questions = await Promise.all(questionPromises);

      console.log(`Successfully loaded all ${questions.length} questions`);
      return questions;
    } catch (error) {
      console.error('Failed to load questions:', error);
      throw new Error(
        'Fehler beim Laden der Spielfragen. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Get published quizzes for a topic.
   */
  async getPublishedQuizzes(topicId?: number): Promise<
    Array<{
      id: number;
      title: string;
      description?: string;
      questionCount: number;
      difficulty: number;
      playCount: number;
      topicId: number;
    }>
  > {
    try {
      const params = topicId ? `?topic_id=${topicId}` : '';
      const response = await apiClient.get<
        Array<{
          id: number;
          title: string;
          description?: string;
          question_count: number;
          difficulty: number;
          play_count: number;
          topic_id: number;
        }>
      >(`/v1/admin/quizzes/published${params}`, {
        headers: this.getAuthHeaders(),
      });

      return response.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.question_count,
        difficulty: quiz.difficulty,
        playCount: quiz.play_count,
        topicId: quiz.topic_id,
      }));
    } catch (error) {
      console.error('Failed to get published quizzes:', error);
      throw new Error(
        'Fehler beim Laden der veröffentlichten Quizze. Bitte versuchen Sie es erneut.'
      );
    }
  }
}

// Export singleton instance
export const gameService = new GameService();
export { GameService };
export default gameService;
