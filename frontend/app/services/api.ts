/**
 * API service for Quizdom application.
 * Handles all HTTP requests to the backend following cursor rules structure.
 */

import { apiClient } from '../api/client';
import type { GameTopic } from '../types/topics';
import type { GameMode } from '../types/game';

/**
 * Health check service.
 */
export const healthService = {
  /**
   * Check if backend is healthy.
   */
  async check(): Promise<{ status: string }> {
    return apiClient.healthCheck();
  },
};

/**
 * Topics service - handles topic-related API calls.
 */
export const topicsService = {
  /**
   * Fetch all topics.
   */
  async getAll(): Promise<GameTopic[]> {
    const response = await apiClient.get<any[]>('/v1/admin/topics');
    return response.map(topic => ({
      id: topic.id.toString(),
      title: topic.title,
      description: topic.description || '',
      category: 'General', // Topics don't have categories in our backend
      totalQuestions: 0, // Would need to fetch this separately
      completedQuestions: 0, // Not tracked in backend yet
      image: '📚', // Default icon as image
      stars: 0, // Not implemented in backend yet
      popularity: 0, // Not implemented in backend yet
      wisecoinReward: 10, // Default reward
      isCompleted: false, // Not tracked in backend yet
      isFavorite: false, // Not implemented in backend yet
    }));
  },

  /**
   * Fetch topic by ID.
   */
  async getById(id: string): Promise<GameTopic | null> {
    try {
      const response = await apiClient.get<any>(`/v1/admin/topics/${id}`);
      return {
        id: response.id.toString(),
        title: response.title,
        description: response.description || '',
        category: 'General',
        totalQuestions: 0,
        completedQuestions: 0,
        image: '📚',
        stars: 0,
        popularity: 0,
        wisecoinReward: 10,
        isCompleted: false,
        isFavorite: false,
      };
    } catch {
      return null;
    }
  },

  /**
   * Update topic favorite status.
   * TODO: Replace with real backend endpoint when available.
   */
  async updateFavorite(_id: string, _isFavorite: boolean): Promise<GameTopic> {
    // For now, throw error to indicate backend endpoint needed
    throw new Error(
      `Backend endpoint PUT /topics/${_id}/favorite not implemented yet`
    );
  },
};

/**
 * Categories service - handles category-related API calls.
 */
export const categoriesService = {
  /**
   * Fetch all categories.
   * TODO: Replace with real backend endpoint when available.
   */
  async getAll(): Promise<string[]> {
    // For now, throw error to indicate backend endpoint needed
    throw new Error('Backend endpoint /categories not implemented yet');
  },
};

/**
 * Quiz service - handles quiz game API calls.
 */
export const quizService = {
  /**
   * Start a new quiz session.
   * TODO: Replace with real backend endpoint when available.
   */
  async startSession(
    _topicId: string,
    _mode: GameMode
  ): Promise<{ sessionId: string }> {
    // For now, throw error to indicate backend endpoint needed
    throw new Error('Backend endpoint POST /quiz/sessions not implemented yet');
  },

  /**
   * Get next question for a quiz session.
   * TODO: Replace with real backend endpoint when available.
   */
  async getNextQuestion(_sessionId: string): Promise<{
    id: string;
    text: string;
    answers: string[];
    timeLimit: number;
  }> {
    // For now, throw error to indicate backend endpoint needed
    throw new Error(
      `Backend endpoint GET /quiz/sessions/${_sessionId}/next-question not implemented yet`
    );
  },

  /**
   * Submit answer for a question.
   * TODO: Replace with real backend endpoint when available.
   */
  async submitAnswer(
    _sessionId: string,
    _questionId: string,
    _answerIndex: number
  ): Promise<{
    correct: boolean;
    points: number;
    correctAnswer: number;
  }> {
    // For now, throw error to indicate backend endpoint needed
    throw new Error(
      `Backend endpoint POST /quiz/sessions/${_sessionId}/answers not implemented yet`
    );
  },
};

/**
 * User service - handles user-related API calls.
 * Note: Direct user access endpoints have been removed for security reasons.
 * Use authentication endpoints (/v1/auth/me) for user data instead.
 */
export const userService = {
  // Removed getById method - use auth service for user data
};

/**
 * Combined API service object.
 */
export const apiService = {
  health: healthService,
  topics: topicsService,
  categories: categoriesService,
  quiz: quizService,
  user: userService,
};
