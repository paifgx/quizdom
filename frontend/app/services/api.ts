/**
 * API service for Quizdom application.
 * Handles all HTTP requests to the backend following cursor rules structure.
 */

import { apiClient } from '../api/client';
import { gameService } from '../services/game';
import type { GameTopic } from '../types/topics';
import type { GameModeId } from '../types/game';

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
    const response = await apiClient.get<
      Array<{
        id: number;
        title: string;
        description?: string;
      }>
    >('/v1/admin/topics');
    return response.map(topic => ({
      id: topic.id.toString(),
      title: topic.title,
      description: topic.description || '',
      category: 'General', // Topics don't have categories in our backend
      totalQuestions: 0, // Would need to fetch this separately
      completedQuestions: 0, // Not tracked in backend yet
      image: '/badges/badge_book_1.png', // Use an actual image path instead of emoji
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
      const response = await apiClient.get<{
        id: number;
        title: string;
        description?: string;
      }>(`/v1/admin/topics/${id}`);
      return {
        id: response.id.toString(),
        title: response.title,
        description: response.description || '',
        category: 'General',
        totalQuestions: 0,
        completedQuestions: 0,
        image: '/badges/badge_book_1.png',
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
 * Now using gameService implementation.
 */
export const quizService = {
  /**
   * Start a new quiz session.
   */
  async startSession(
    topicId: string,
    mode: GameModeId
  ): Promise<{ sessionId: string }> {
    const response = await gameService.startTopicGame(topicId, mode);
    return {
      sessionId: response.session_id.toString(),
    };
  },

  /**
   * Get next question for a quiz session.
   */
  async getNextQuestion(sessionId: string): Promise<{
    id: string;
    text: string;
    answers: string[];
    timeLimit: number;
  }> {
    const sessionIdInt = parseInt(sessionId);
    if (isNaN(sessionIdInt)) {
      throw new Error('Ungültige Sitzungs-ID');
    }

    const question = await gameService.getQuestion(sessionIdInt, 0);
    return {
      id: question.question_id.toString(),
      text: question.content,
      answers: question.answers.map(a => a.content),
      timeLimit: question.time_limit,
    };
  },

  /**
   * Submit answer for a question.
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answerIndex: number
  ): Promise<{
    correct: boolean;
    points: number;
    correctAnswer: number;
  }> {
    const sessionIdInt = parseInt(sessionId);
    const questionIdInt = parseInt(questionId);
    const answerIdInt = answerIndex + 1; // Assuming answer IDs start at 1

    if (isNaN(sessionIdInt) || isNaN(questionIdInt)) {
      throw new Error('Ungültige Parameter');
    }

    const response = await gameService.submitAnswer(
      sessionIdInt,
      questionIdInt,
      answerIdInt
    );

    return {
      correct: response.is_correct,
      points: response.points_earned,
      correctAnswer: response.correct_answer_id,
    };
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
