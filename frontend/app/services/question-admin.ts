/**
 * Question administration service.
 * Handles all question-related API calls for admin users.
 */

import { apiClient } from '../api/client';
import { authService } from './auth';
import type { QuizDifficulty } from '../types/quiz';

interface BackendQuestionResponse {
  id: number;
  topic_id: number;
  difficulty: number; // 1-5 matching backend enum
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

interface BackendTopicResponse {
  id: number;
  title: string;
  description: string | null;
}

interface BackendQuestionCreate {
  topic_id: number;
  difficulty: number; // numeric 1-5
  content: string;
  explanation?: string;
  answers: Array<{
    content: string;
    is_correct: boolean;
  }>;
}

interface BackendQuestionUpdate {
  topic_id?: number;
  difficulty?: number; // numeric 1-5
  content?: string;
  explanation?: string;
}

// Frontend types
export interface Question {
  id: string;
  topicId: string;
  topicTitle: string;
  difficulty: QuizDifficulty; // 1-5
  content: string;
  explanation?: string;
  answers: Answer[];
  createdAt: string;
}

export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
}

export interface CreateQuestionPayload {
  topicId: string;
  difficulty: QuizDifficulty; // 1-5
  content: string;
  explanation?: string;
  answers: Array<{
    content: string;
    isCorrect: boolean;
  }>;
}

export interface UpdateQuestionPayload {
  topicId?: string;
  difficulty?: QuizDifficulty;
  content?: string;
  explanation?: string;
}

export interface QuestionFilters {
  search?: string;
  topicId?: string;
  difficulty?: QuizDifficulty;
}

/**
 * Question administration service class.
 */
class QuestionAdminService {
  private getAuthHeaders(): Record<string, string> {
    return authService.getAuthHeader();
  }

  /**
   * Maps backend question response to frontend question.
   */
  private mapToQuestion(backendQuestion: BackendQuestionResponse): Question {
    return {
      id: backendQuestion.id.toString(),
      topicId: backendQuestion.topic_id.toString(),
      topicTitle: backendQuestion.topic.title,
      difficulty: backendQuestion.difficulty as QuizDifficulty,
      content: backendQuestion.content,
      explanation: backendQuestion.explanation || undefined,
      answers: backendQuestion.answers.map(answer => ({
        id: answer.id.toString(),
        content: answer.content,
        isCorrect: answer.is_correct,
      })),
      createdAt: backendQuestion.created_at,
    };
  }

  /**
   * Maps backend topic response to frontend topic.
   */
  private mapToTopic(backendTopic: BackendTopicResponse): Topic {
    return {
      id: backendTopic.id.toString(),
      title: backendTopic.title,
      description: backendTopic.description || undefined,
    };
  }

  /**
   * Fetch all questions with optional filters.
   */
  async getQuestions(filters?: QuestionFilters): Promise<Question[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.topicId && filters.topicId !== 'all') {
        params.append('topic_id', filters.topicId);
      }

      const response = await apiClient.get<BackendQuestionResponse[]>(
        `/v1/admin/quiz/questions?${params.toString()}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      let questions = response.map(question => this.mapToQuestion(question));

      // Apply client-side filtering for search and difficulty
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        questions = questions.filter(
          question =>
            question.content.toLowerCase().includes(searchLower) ||
            (question.explanation &&
              question.explanation.toLowerCase().includes(searchLower)) ||
            question.topicTitle.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.difficulty) {
        questions = questions.filter(
          question => question.difficulty === filters.difficulty
        );
      }

      return questions;
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw new Error('Failed to load questions. Please try again.');
    }
  }

  /**
   * Fetch a single question by ID.
   */
  async getQuestionById(id: string): Promise<Question> {
    try {
      const response = await apiClient.get<BackendQuestionResponse>(
        `/v1/admin/quiz/questions/${id}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToQuestion(response);
    } catch (error) {
      console.error('Failed to fetch question:', error);
      throw new Error('Failed to load question. Please try again.');
    }
  }

  /**
   * Create a new question.
   */
  async createQuestion(payload: CreateQuestionPayload): Promise<Question> {
    try {
      const backendPayload: BackendQuestionCreate = {
        topic_id: parseInt(payload.topicId),
        difficulty: payload.difficulty,
        content: payload.content,
        explanation: payload.explanation,
        answers: payload.answers.map(answer => ({
          content: answer.content,
          is_correct: answer.isCorrect,
        })),
      };

      const response = await apiClient.post<BackendQuestionResponse>(
        '/v1/admin/quiz/questions',
        backendPayload,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToQuestion(response);
    } catch (error) {
      console.error('Failed to create question:', error);
      throw new Error('Failed to create question. Please try again.');
    }
  }

  /**
   * Update an existing question.
   */
  async updateQuestion(
    id: string,
    payload: UpdateQuestionPayload
  ): Promise<Question> {
    try {
      const backendPayload: BackendQuestionUpdate = {};

      if (payload.topicId) backendPayload.topic_id = parseInt(payload.topicId);
      if (payload.difficulty) backendPayload.difficulty = payload.difficulty;
      if (payload.content) backendPayload.content = payload.content;
      if (payload.explanation !== undefined)
        backendPayload.explanation = payload.explanation;

      const response = await apiClient.put<BackendQuestionResponse>(
        `/v1/admin/quiz/questions/${id}`,
        backendPayload,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToQuestion(response);
    } catch (error) {
      console.error('Failed to update question:', error);
      throw new Error('Failed to update question. Please try again.');
    }
  }

  /**
   * Delete a question.
   */
  async deleteQuestion(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/admin/quiz/questions/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw new Error('Failed to delete question. Please try again.');
    }
  }

  /**
   * Get all topics.
   */
  async getTopics(): Promise<Topic[]> {
    try {
      const response = await apiClient.get<BackendTopicResponse[]>(
        '/v1/admin/quiz/topics',
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.map(topic => this.mapToTopic(topic));
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      throw new Error('Failed to load topics. Please try again.');
    }
  }

  /**
   * Create a new topic.
   */
  async createTopic(payload: {
    title: string;
    description?: string;
  }): Promise<Topic> {
    try {
      const response = await apiClient.post<BackendTopicResponse>(
        '/v1/admin/quiz/topics',
        {
          title: payload.title,
          description: payload.description || null,
        },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToTopic(response);
    } catch (error) {
      console.error('Failed to create topic:', error);
      throw new Error('Failed to create topic. Please try again.');
    }
  }

  /**
   * Update an existing topic.
   */
  async updateTopic(
    id: string,
    payload: { title?: string; description?: string }
  ): Promise<Topic> {
    try {
      const response = await apiClient.put<BackendTopicResponse>(
        `/v1/admin/quiz/topics/${id}`,
        {
          ...(payload.title && { title: payload.title }),
          ...(payload.description !== undefined && {
            description: payload.description,
          }),
        },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return this.mapToTopic(response);
    } catch (error) {
      console.error('Failed to update topic:', error);
      throw new Error('Failed to update topic. Please try again.');
    }
  }

  /**
   * Delete a topic.
   */
  async deleteTopic(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/admin/quiz/topics/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete topic:', error);
      throw new Error('Failed to delete topic. Please try again.');
    }
  }
}

// Export singleton instance
export const questionAdminService = new QuestionAdminService();
