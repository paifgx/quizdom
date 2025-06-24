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
   * TODO: Replace with real backend endpoint when available.
   */
  async getAll(): Promise<GameTopic[]> {
    // For now, throw error to indicate backend endpoint needed
    throw new Error('Backend endpoint /topics not implemented yet');
  },

  /**
   * Fetch topic by ID.
   * TODO: Replace with real backend endpoint when available.
   */
  async getById(_id: string): Promise<GameTopic | null> {
    // For now, throw error to indicate backend endpoint needed
    throw new Error(`Backend endpoint /topics/${_id} not implemented yet`);
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
 */
export const userService = {
  /**
   * Get user by ID (for testing purposes).
   */
  async getById(id: string): Promise<unknown> {
    return apiClient.get(`/users/${id}`);
  },
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
