/**
 * Quiz administration service.
 * Handles all quiz-related API calls for admin users.
 */

import { apiClient } from '../api/client';
import { authService } from './auth';
import type {
  Quiz,
  QuizSummary,
  QuizFilters,
  QuizStatistics,
  CreateQuizPayload,
  UpdateQuizPayload,
  QuizQuestion,
  CreateQuizBatchPayload,
  QuizDifficulty,
  QuizStatus,
} from '../types/quiz';
import { QuestionType } from '../types/quiz';

interface BackendQuizResponse {
  id: number;
  title: string;
  description: string | null;
  topic_id: number;
  difficulty: number;
  time_limit_minutes: number | null;
  created_at: string;
  topic: {
    id: number;
    title: string;
    description: string | null;
  };
  question_count: number;
  status: QuizStatus;
  published_at: string | null;
  play_count: number;
}

interface BackendQuizDetailResponse extends BackendQuizResponse {
  questions: BackendQuestionResponse[];
}

interface BackendQuestionResponse {
  id: number;
  topic_id: number;
  difficulty: number;
  content: string;
  explanation: string | null;
  created_at: string;
  answers: BackendAnswerResponse[];
  topic: {
    id: number;
    title: string;
    description: string | null;
  };
}

interface BackendAnswerResponse {
  id: number;
  content: string;
  is_correct: boolean;
}

/**
 * Quiz administration service class.
 */
class QuizAdminService {
  private getAuthHeaders(): Record<string, string> {
    return authService.getAuthHeader();
  }

  /**
   * Gets difficulty name for display.
   */
  private getDifficultyName(difficulty: number): string {
    switch (difficulty) {
      case 1:
        return 'Anfänger';
      case 2:
        return 'Lehrling';
      case 3:
        return 'Geselle';
      case 4:
        return 'Meister';
      case 5:
        return 'Großmeister';
      default:
        return 'Unbekannt';
    }
  }

  /**
   * Map frontend numeric difficulty to backend difficulty.
   */
  private mapDifficultyToBackend(difficulty: QuizDifficulty): number {
    return difficulty; // Frontend now uses numeric difficulties that match backend
  }

  /**
   * Maps backend quiz response to frontend quiz summary.
   */
  private mapToQuizSummary(backendQuiz: BackendQuizResponse): QuizSummary {
    return {
      id: backendQuiz.id.toString(),
      title: backendQuiz.title,
      description: backendQuiz.description || '',
      difficulty: backendQuiz.difficulty as QuizDifficulty,
      status: backendQuiz.status,
      questionCount: backendQuiz.question_count,
      totalPoints: backendQuiz.question_count * 10, // Estimate: 10 points per question
      estimatedDuration: backendQuiz.time_limit_minutes || 15,
      playCount: backendQuiz.play_count,
      averageScore: 0, // Not available in backend yet
      createdAt: backendQuiz.created_at,
      updatedAt: backendQuiz.published_at || backendQuiz.created_at,
      createdBy: 'admin', // Not available in backend yet
    };
  }

  /**
   * Maps backend detailed quiz response to frontend quiz.
   */
  private mapToQuiz(backendQuiz: BackendQuizDetailResponse): Quiz {
    const questions: QuizQuestion[] = backendQuiz.questions.map((q, index) => ({
      id: q.id.toString(),
      type: QuestionType.MULTIPLE_CHOICE,
      text: q.content,
      explanation: q.explanation || undefined,
      points: 10, // Default points
      timeLimit: 30, // Default time limit in seconds
      answers: q.answers.map(a => ({
        id: a.id.toString(),
        text: a.content,
        isCorrect: a.is_correct,
      })),
      order: index,
    }));

    return {
      id: backendQuiz.id.toString(),
      title: backendQuiz.title,
      description: backendQuiz.description || '',
      difficulty: backendQuiz.difficulty as QuizDifficulty,
      status: backendQuiz.status,
      questions,
      settings: {
        randomizeQuestions: false,
        randomizeAnswers: false,
        showExplanations: true,
        allowSkipping: false,
        showProgress: true,
        passingScore: 70,
      },
      tags: [],
      estimatedDuration: backendQuiz.time_limit_minutes || 15,
      totalPoints: questions.length * 10,
      createdAt: backendQuiz.created_at,
      updatedAt: backendQuiz.published_at || backendQuiz.created_at,
      createdBy: 'admin',
    };
  }

  /**
   * Fetch all quizzes with optional filters.
   */
  async getQuizzes(filters?: QuizFilters): Promise<QuizSummary[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) {
        // Backend doesn't support search yet, we'll filter client-side
      }
      if (filters?.difficulty) {
        params.append('difficulty', filters.difficulty.toString());
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const response = await apiClient.get<BackendQuizResponse[]>(
        `/v1/admin/quizzes?${params.toString()}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      let quizzes = response.map(quiz => this.mapToQuizSummary(quiz));

      // Apply client-side filtering for search only, as others are handled by backend
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        quizzes = quizzes.filter(
          quiz =>
            quiz.title.toLowerCase().includes(searchLower) ||
            quiz.description.toLowerCase().includes(searchLower)
        );
      }

      return quizzes;
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      throw new Error(
        'Fehler beim Laden der Quizzes. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Fetch a single quiz by ID.
   */
  async getQuizById(id: string): Promise<Quiz> {
    try {
      const response = await apiClient.get<BackendQuizDetailResponse>(
        `/v1/admin/quizzes/${id}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToQuiz(response);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      throw new Error(
        'Fehler beim Laden des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Create a new quiz.
   */
  async createQuiz(payload: CreateQuizPayload): Promise<Quiz> {
    try {
      // Use a default topic for all quizzes since we removed categories
      const topics = await this.getTopics();
      let topicId = topics.find(t => t.title === 'General')?.id;

      if (!topicId) {
        // Create default topic if it doesn't exist
        const newTopic = await this.createTopic({
          title: 'General',
          description: 'Default topic for quizzes',
        });
        topicId = newTopic.id;
      }

      const backendPayload: Partial<{
        title: string;
        description: string;
        topic_id: number;
        difficulty: number;
        time_limit_minutes: number | null;
        question_ids: number[];
      }> = {
        title: payload.title,
        description: payload.description,
        topic_id: topicId,
        difficulty: payload.difficulty,
        time_limit_minutes: 15,
        question_ids: payload.questionIds
          ? payload.questionIds.map(id => parseInt(id))
          : [],
      };

      const response = await apiClient.post<BackendQuizDetailResponse>(
        '/v1/admin/quizzes',
        backendPayload,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToQuiz(response);
    } catch (error) {
      console.error('Failed to create quiz:', error);
      throw new Error(
        'Fehler beim Erstellen des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Update an existing quiz.
   */
  async updateQuiz(id: string, payload: UpdateQuizPayload): Promise<Quiz> {
    try {
      const backendPayload: Partial<{
        title: string;
        description: string;
        topic_id: number;
        difficulty: number;
        time_limit_minutes: number | null;
        question_ids: number[];
      }> = {};

      if (payload.title) backendPayload.title = payload.title;
      if (payload.description) backendPayload.description = payload.description;
      if (payload.difficulty) backendPayload.difficulty = payload.difficulty;
      if (payload.questionIds)
        backendPayload.question_ids = payload.questionIds.map(id =>
          parseInt(id)
        );

      const response = await apiClient.put<BackendQuizDetailResponse>(
        `/v1/admin/quizzes/${id}`,
        backendPayload,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToQuiz(response);
    } catch (error) {
      console.error('Failed to update quiz:', error);
      throw new Error(
        'Fehler beim Aktualisieren des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Delete a quiz.
   */
  async deleteQuiz(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/admin/quizzes/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      throw new Error(
        'Fehler beim Löschen des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Publish a quiz.
   */
  async publishQuiz(id: string): Promise<Quiz> {
    try {
      const response = await apiClient.post<BackendQuizDetailResponse>(
        `/v1/admin/quizzes/${id}/publish`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
      return this.mapToQuiz(response);
    } catch (error) {
      console.error('Failed to publish quiz:', error);
      throw new Error(
        'Fehler beim Veröffentlichen des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Archive a quiz.
   */
  async archiveQuiz(id: string): Promise<Quiz> {
    try {
      const response = await apiClient.post<BackendQuizDetailResponse>(
        `/v1/admin/quizzes/${id}/archive`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
      return this.mapToQuiz(response);
    } catch (error) {
      console.error('Failed to archive quiz:', error);
      throw new Error(
        'Fehler beim Archivieren des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Reactivate an archived quiz.
   */
  async reactivateQuiz(id: string): Promise<Quiz> {
    try {
      const response = await apiClient.post<BackendQuizDetailResponse>(
        `/v1/admin/quizzes/${id}/reactivate`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
      return this.mapToQuiz(response);
    } catch (error) {
      console.error('Failed to reactivate quiz:', error);
      throw new Error(
        'Fehler beim Reaktivieren des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Add a question to a quiz.
   */
  async addQuestion(
    _quizId: string,
    _question: Omit<QuizQuestion, 'id'>
  ): Promise<QuizQuestion> {
    try {
      // This would require updating the quiz's question_ids
      // For now, throw an error indicating this needs backend support
      throw new Error(
        'Das Hinzufügen von Fragen zu bestehenden Quizzes wird vom Backend noch nicht unterstützt.'
      );
    } catch (error) {
      console.error('Failed to add question:', error);
      throw error;
    }
  }

  /**
   * Update a question in a quiz.
   */
  async updateQuestion(
    _quizId: string,
    _questionId: string,
    _question: Partial<QuizQuestion>
  ): Promise<QuizQuestion> {
    try {
      // This would require separate question update endpoint
      throw new Error(
        'Das Aktualisieren einzelner Fragen wird vom Backend noch nicht unterstützt.'
      );
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error;
    }
  }

  /**
   * Delete a question from a quiz.
   */
  async deleteQuestion(_quizId: string, _questionId: string): Promise<void> {
    try {
      // This would require updating the quiz's question_ids
      throw new Error(
        'Das Löschen einzelner Fragen wird vom Backend noch nicht unterstützt.'
      );
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw error;
    }
  }

  /**
   * Reorder questions in a quiz.
   */
  async reorderQuestions(
    _quizId: string,
    _questionIds: string[]
  ): Promise<void> {
    try {
      // This would require updating the quiz's question_ids order
      throw new Error(
        'Das Neuordnen von Fragen wird vom Backend noch nicht unterstützt.'
      );
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      throw error;
    }
  }

  /**
   * Get quiz statistics.
   */
  async getStatistics(): Promise<QuizStatistics> {
    try {
      const quizzes = await this.getQuizzes();

      return {
        totalQuizzes: quizzes.length,
        publishedQuizzes: quizzes.filter(q => q.status === 'published').length,
        draftQuizzes: quizzes.filter(q => q.status === 'draft').length,
        totalQuestions: quizzes.reduce((sum, q) => sum + q.questionCount, 0),
        totalPlays: quizzes.reduce((sum, q) => sum + q.playCount, 0),
        averageCompletionRate: 85, // Placeholder
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw new Error(
        'Fehler beim Laden der Statistiken. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Get available categories (topics).
   */
  async getCategories(): Promise<string[]> {
    try {
      const topics = await this.getTopics();
      return topics.map(topic => topic.title);
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw new Error(
        'Fehler beim Laden der Kategorien. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Duplicate a quiz.
   */
  async duplicateQuiz(id: string): Promise<Quiz> {
    try {
      const originalQuiz = await this.getQuizById(id);
      const duplicatePayload: CreateQuizPayload = {
        title: `${originalQuiz.title} (Copy)`,
        description: originalQuiz.description,
        difficulty: originalQuiz.difficulty,
        tags: originalQuiz.tags,
        imageUrl: originalQuiz.imageUrl,
        settings: originalQuiz.settings,
      };

      return this.createQuiz(duplicatePayload);
    } catch (error) {
      console.error('Failed to duplicate quiz:', error);
      throw new Error(
        'Fehler beim Duplizieren des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Get topics from backend.
   */
  private async getTopics(): Promise<
    Array<{ id: number; title: string; description: string | null }>
  > {
    try {
      return await apiClient.get('/v1/admin/topics', {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to get topics:', error);
      return [];
    }
  }

  /**
   * Create a new topic.
   */
  private async createTopic(payload: {
    title: string;
    description: string;
  }): Promise<{ id: number; title: string; description: string | null }> {
    return apiClient.post('/v1/admin/topics', payload, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Create a new quiz with questions in a single batch operation.
   */
  async createQuizBatch(payload: CreateQuizBatchPayload): Promise<Quiz> {
    try {
      // Use a default topic for all quizzes and questions since we removed categories
      const topics = await this.getTopics();
      let topicId = topics.find(t => t.title === 'General')?.id;

      if (!topicId) {
        // Create default topic if it doesn't exist
        const newTopic = await this.createTopic({
          title: 'General',
          description: 'Default topic for quizzes',
        });
        topicId = newTopic.id;
      }

      const backendPayload = {
        title: payload.title,
        description: payload.description,
        topic_id: topicId,
        difficulty: this.mapDifficultyToBackend(payload.difficulty),
        time_limit_minutes: payload.estimatedDuration || 15,
        questions: payload.questions.map(q => ({
          topic_id: topicId,
          difficulty: q.difficulty,
          content: q.content,
          explanation: q.explanation || null,
          answers: q.answers.map(a => ({
            content: a.content,
            is_correct: a.isCorrect,
          })),
        })),
      };

      const response = await apiClient.post<BackendQuizDetailResponse>(
        '/v1/admin/quizzes/batch',
        backendPayload,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToQuiz(response);
    } catch (error) {
      console.error('Failed to create quiz batch:', error);
      throw new Error(
        'Fehler beim Erstellen des Quiz mit Fragen. Bitte versuchen Sie es erneut.'
      );
    }
  }

  /**
   * Create multiple questions in a batch operation.
   * This is useful for adding new questions to an existing quiz.
   */
  async createQuestions(
    questions: CreateQuizBatchPayload['questions']
  ): Promise<QuizQuestion[]> {
    try {
      // Use a default topic for all questions since we removed categories
      const topics = await this.getTopics();
      let topicId = topics.find(t => t.title === 'General')?.id;

      if (!topicId) {
        // Create default topic if it doesn't exist
        const newTopic = await this.createTopic({
          title: 'General',
          description: 'Default topic for quizzes',
        });
        topicId = newTopic.id;
      }

      const backendPayload = questions.map(q => ({
        topic_id: topicId,
        difficulty: q.difficulty,
        content: q.content,
        explanation: q.explanation || null,
        answers: q.answers.map(a => ({
          content: a.content,
          is_correct: a.isCorrect,
        })),
      }));

      const response = await apiClient.post<BackendQuestionResponse[]>(
        '/v1/admin/questions/batch',
        backendPayload,
        {
          headers: this.getAuthHeaders(),
        }
      );

      // Map the backend response to frontend format
      return response.map(q => ({
        id: q.id.toString(),
        type: QuestionType.MULTIPLE_CHOICE,
        text: q.content,
        explanation: q.explanation || undefined,
        points: 1,
        timeLimit: 60,
        answers: q.answers.map(a => ({
          id: a.id.toString(),
          text: a.content,
          isCorrect: a.is_correct,
        })),
        order: 0,
      }));
    } catch (error) {
      console.error('Failed to create questions:', error);
      throw new Error(
        'Fehler beim Erstellen der Fragen. Bitte versuchen Sie es erneut.'
      );
    }
  }
}

// Export singleton instance
export const quizAdminService = new QuizAdminService();
