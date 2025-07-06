import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import AdminQuizzesPage from '../../app/routes/admin.quizzes';
import { quizAdminService } from '../../app/services/quiz-admin';
import type { QuizSummary } from '../../app/types/quiz';
import type { Mock } from 'vitest';
import { AuthProvider } from '../../app/contexts/auth';

vi.mock('../../app/services/auth', () => ({
  authService: {
    isAuthenticated: () => true,
    getCurrentUser: () =>
      Promise.resolve({
        id: 1,
        email: 'admin@test.com',
        is_verified: true,
        role_name: 'admin',
        nickname: 'Test Admin',
        avatar_url: '',
        bio: '',
      }),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

vi.mock('../../app/services/quiz-admin');

const mockQuizzes: QuizSummary[] = [
  {
    id: '1',
    title: 'Draft Quiz',
    status: 'draft',
    difficulty: 1,
    questionCount: 5,
    playCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: '',
    totalPoints: 50,
    estimatedDuration: 10,
    averageScore: 0,
    createdBy: 'admin',
  },
  {
    id: '2',
    title: 'Published Quiz',
    status: 'published',
    difficulty: 2,
    questionCount: 10,
    playCount: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: '',
    totalPoints: 100,
    estimatedDuration: 20,
    averageScore: 85,
    createdBy: 'admin',
  },
];

describe('AdminQuizzesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    );
  };

  it('should publish a quiz and update the list', async () => {
    // Arrange
    (quizAdminService.getQuizzes as Mock).mockResolvedValue(mockQuizzes);
    const updatedQuiz = {
      ...mockQuizzes[0],
      status: 'published',
      questions: [],
      settings: {},
      tags: [],
    };
    (quizAdminService.publishQuiz as Mock).mockResolvedValue(updatedQuiz);

    renderWithProviders(<AdminQuizzesPage />);

    // Wait for quizzes to load
    await waitFor(() => {
      expect(screen.getByText('Draft Quiz')).toBeInTheDocument();
    });

    // Act
    const optionsButton = screen.getAllByTitle('Weitere Optionen')[0];
    fireEvent.click(optionsButton);

    const publishButton = await screen.findByText('Veröffentlichen');
    fireEvent.click(publishButton);

    // Assert
    await waitFor(() => {
      expect(quizAdminService.publishQuiz).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      // The status badge should be updated
      const statusBadges = screen.getAllByText('Veröffentlicht');
      expect(statusBadges.length).toBeGreaterThan(1);
    });
  });

  it('should archive a quiz and update the list', async () => {
    // Arrange
    (quizAdminService.getQuizzes as Mock).mockResolvedValue(mockQuizzes);
    const updatedQuiz = {
      ...mockQuizzes[1],
      status: 'archived',
      questions: [],
      settings: {},
      tags: [],
    };
    (quizAdminService.archiveQuiz as Mock).mockResolvedValue(updatedQuiz);

    renderWithProviders(<AdminQuizzesPage />);

    await waitFor(() => {
      expect(screen.getByText('Published Quiz')).toBeInTheDocument();
    });

    // Act
    const optionsButton = screen.getAllByTitle('Weitere Optionen')[1];
    fireEvent.click(optionsButton);

    const archiveButton = await screen.findByText('Archivieren');
    fireEvent.click(archiveButton);

    // Assert
    await waitFor(() => {
      expect(quizAdminService.archiveQuiz).toHaveBeenCalledWith('2');
    });

    await waitFor(() => {
      expect(
        screen.getByText('Archiviert', { selector: 'span' })
      ).toBeInTheDocument();
    });
  });
});
