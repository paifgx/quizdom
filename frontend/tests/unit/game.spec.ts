/**
 * Unit tests for game service
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameService } from '../../app/services/game';
import { apiClient } from '../../app/api/client';
import { authService } from '../../app/services/auth';

// Mock dependencies
vi.mock('../../app/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../app/services/auth', () => ({
  authService: {
    getToken: vi.fn(),
  },
}));

describe('GameService', () => {
  let gameService: GameService;
  const mockToken = 'mock-token';
  const mockAuthHeaders = { Authorization: `Bearer ${mockToken}` };

  beforeEach(() => {
    vi.resetAllMocks();
    // Setup authentication mock
    (authService.getToken as ReturnType<typeof vi.fn>).mockReturnValue(
      mockToken
    );
    // Create a new instance for each test
    gameService = new GameService();
  });

  describe('GameMode conversion', () => {
    it('converts solo mode correctly', () => {
      // @ts-ignore - Access private method for testing
      expect(gameService['toBackendGameMode']('solo')).toBe('solo');
    });

    it('converts competitive mode correctly', () => {
      // @ts-ignore - Access private method for testing
      expect(gameService['toBackendGameMode']('competitive')).toBe('comp');
    });

    it('converts collaborative mode correctly', () => {
      // @ts-ignore - Access private method for testing
      expect(gameService['toBackendGameMode']('collaborative')).toBe('collab');
    });

    it('throws for unknown modes', () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      expect(() => gameService['toBackendGameMode']('invalid')).toThrow(
        'Unknown game mode: invalid'
      );
    });
  });

  describe('startQuizGame', () => {
    it('calls the correct endpoint with proper parameters and auth header', async () => {
      const mockQuizId = '123';
      const mockMode = 'solo';
      const mockResponse = {
        session_id: 456,
        mode: 'solo',
        quiz_id: 123,
        quiz_title: 'Test Quiz',
        total_questions: 10,
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      const result = await gameService.startQuizGame(mockQuizId, mockMode);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/v1/game/quiz/${mockQuizId}/start`,
        { mode: 'solo' }, // Should be the backend mode
        { headers: mockAuthHeaders }
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles errors correctly with German error message', async () => {
      const mockQuizId = '123';
      const mockMode = 'solo';

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        gameService.startQuizGame(mockQuizId, mockMode)
      ).rejects.toThrow(
        'Fehler beim Starten des Spiels. Bitte versuchen Sie es erneut.'
      );
    });
  });

  describe('getQuestion', () => {
    it('calls the correct endpoint with proper parameters and auth header', async () => {
      const mockSessionId = 123;
      const mockQuestionIndex = 0;
      const mockResponse = {
        question_id: 456,
        question_number: 1,
        content: 'What is the capital of France?',
        answers: [
          { id: 1, content: 'Paris' },
          { id: 2, content: 'London' },
        ],
        time_limit: 30,
        show_timestamp: 1623456789000,
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      const result = await gameService.getQuestion(
        mockSessionId,
        mockQuestionIndex
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        `/v1/game/session/${mockSessionId}/question/${mockQuestionIndex}`,
        { headers: mockAuthHeaders }
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles errors correctly with German error message', async () => {
      const mockSessionId = 123;
      const mockQuestionIndex = 0;

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        gameService.getQuestion(mockSessionId, mockQuestionIndex)
      ).rejects.toThrow(
        'Fehler beim Laden der Frage. Bitte versuchen Sie es erneut.'
      );
    });
  });

  describe('submitAnswer', () => {
    it('calls the correct endpoint with proper parameters and auth header', async () => {
      const mockSessionId = 123;
      const mockQuestionId = 456;
      const mockAnswerId = 1;
      const mockResponse = {
        is_correct: true,
        correct_answer_id: 1,
        points_earned: 10,
        response_time_ms: 1500,
        player_score: 30,
        player_hearts: 3,
        explanation: 'Paris is the capital of France.',
      };

      vi.spyOn(Date, 'now').mockReturnValue(1623456789000);
      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      const result = await gameService.submitAnswer(
        mockSessionId,
        mockQuestionId,
        mockAnswerId
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        `/v1/game/session/${mockSessionId}/answer`,
        {
          question_id: mockQuestionId,
          answer_id: mockAnswerId,
          answered_at: 1623456789000,
        },
        { headers: mockAuthHeaders }
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles errors correctly with German error message', async () => {
      const mockSessionId = 123;
      const mockQuestionId = 456;
      const mockAnswerId = 1;

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        gameService.submitAnswer(mockSessionId, mockQuestionId, mockAnswerId)
      ).rejects.toThrow(
        'Fehler beim Übermitteln der Antwort. Bitte versuchen Sie es erneut.'
      );
    });
  });

  describe('getPublishedQuizzes', () => {
    it('calls the correct endpoint with no topic filter and transforms response correctly', async () => {
      const mockResponse = [
        {
          id: 1,
          title: 'Quiz 1',
          description: 'Description 1',
          question_count: 10,
          difficulty: 3,
          play_count: 5,
          topic_id: 100,
        },
        {
          id: 2,
          title: 'Quiz 2',
          description: 'Description 2',
          question_count: 5,
          difficulty: 2,
          play_count: 10,
          topic_id: 200,
        },
      ];

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      const result = await gameService.getPublishedQuizzes();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/v1/admin/quizzes/published',
        { headers: mockAuthHeaders }
      );

      expect(result).toEqual([
        {
          id: 1,
          title: 'Quiz 1',
          description: 'Description 1',
          questionCount: 10,
          difficulty: 3,
          playCount: 5,
          topicId: 100,
        },
        {
          id: 2,
          title: 'Quiz 2',
          description: 'Description 2',
          questionCount: 5,
          difficulty: 2,
          playCount: 10,
          topicId: 200,
        },
      ]);
    });

    it('calls the correct endpoint with topic filter and transforms response correctly', async () => {
      const mockTopicId = 100;
      const mockResponse = [
        {
          id: 1,
          title: 'Quiz 1',
          description: 'Description 1',
          question_count: 10,
          difficulty: 3,
          play_count: 5,
          topic_id: 100,
        },
      ];

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      const result = await gameService.getPublishedQuizzes(mockTopicId);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/v1/admin/quizzes/published?topic_id=${mockTopicId}`,
        { headers: mockAuthHeaders }
      );

      expect(result).toEqual([
        {
          id: 1,
          title: 'Quiz 1',
          description: 'Description 1',
          questionCount: 10,
          difficulty: 3,
          playCount: 5,
          topicId: 100,
        },
      ]);
    });
  });
});
