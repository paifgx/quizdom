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
} from '../types/quiz';

/**
 * Quiz administration service class.
 */
class QuizAdminService {
  private getAuthHeaders(): Record<string, string> {
    return authService.getAuthHeader();
  }

  /**
   * Fetch all quizzes with optional filters.
   */
  async getQuizzes(filters?: QuizFilters): Promise<QuizSummary[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));

    return apiClient.get(`/admin/quizzes?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Fetch a single quiz by ID.
   */
  async getQuizById(id: string): Promise<Quiz> {
    return apiClient.get(`/admin/quizzes/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Create a new quiz.
   */
  async createQuiz(payload: CreateQuizPayload): Promise<Quiz> {
    return apiClient.post('/admin/quizzes', payload, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Update an existing quiz.
   */
  async updateQuiz(id: string, payload: UpdateQuizPayload): Promise<Quiz> {
    return apiClient.put(`/admin/quizzes/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Delete a quiz.
   */
  async deleteQuiz(id: string): Promise<void> {
    return apiClient.delete(`/admin/quizzes/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Publish a quiz.
   */
  async publishQuiz(id: string): Promise<Quiz> {
    return apiClient.post(
      `/admin/quizzes/${id}/publish`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Archive a quiz.
   */
  async archiveQuiz(id: string): Promise<Quiz> {
    return apiClient.post(
      `/admin/quizzes/${id}/archive`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Add a question to a quiz.
   */
  async addQuestion(
    quizId: string,
    question: Omit<QuizQuestion, 'id'>
  ): Promise<QuizQuestion> {
    return apiClient.post(`/admin/quizzes/${quizId}/questions`, question, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Update a question in a quiz.
   */
  async updateQuestion(
    quizId: string,
    questionId: string,
    question: Partial<QuizQuestion>
  ): Promise<QuizQuestion> {
    return apiClient.put(
      `/admin/quizzes/${quizId}/questions/${questionId}`,
      question,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Delete a question from a quiz.
   */
  async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    return apiClient.delete(
      `/admin/quizzes/${quizId}/questions/${questionId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Reorder questions in a quiz.
   */
  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
    return apiClient.put(
      `/admin/quizzes/${quizId}/questions/reorder`,
      { questionIds },
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Get quiz statistics.
   */
  async getStatistics(): Promise<QuizStatistics> {
    return apiClient.get('/admin/quizzes/statistics', {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Get available categories.
   */
  async getCategories(): Promise<string[]> {
    return apiClient.get('/admin/quizzes/categories', {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Duplicate a quiz.
   */
  async duplicateQuiz(id: string): Promise<Quiz> {
    return apiClient.post(
      `/admin/quizzes/${id}/duplicate`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
}

// Export singleton instance
export const quizAdminService = new QuizAdminService();
