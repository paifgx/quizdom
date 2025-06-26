import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import { QuizList } from '../components/admin/quiz-list';
import { quizAdminService } from '../services/quiz-admin';
import type { QuizSummary, QuizStatus, QuizFilters } from '../types/quiz';

export function meta() {
  return [
    { title: 'Quizze verwalten | Quizdom Admin' },
    {
      name: 'description',
      content: 'Erstellen und verwalten Sie Quizze für Ihre Spieler.',
    },
  ];
}

export default function AdminQuizzesPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<QuizFilters>({
    search: '',
    category: 'all',
    difficulty: undefined,
    status: undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'all' | 'easy' | 'medium' | 'hard'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | QuizStatus>(
    'all'
  );

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Update filters when individual filter states change
  useEffect(() => {
    const newFilters: QuizFilters = {
      search: searchTerm || undefined,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
    };
    setFilters(newFilters);
    loadQuizzes(newFilters);
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load quizzes and categories in parallel
      const [quizzesData, categoriesData] = await Promise.all([
        quizAdminService.getQuizzes(),
        quizAdminService.getCategories(),
      ]);

      setQuizzes(quizzesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async (currentFilters: QuizFilters) => {
    try {
      setError(null);
      const quizzesData = await quizAdminService.getQuizzes(currentFilters);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load quizzes'
      );
    }
  };

  const handleStatusChange = async (quizId: string, newStatus: QuizStatus) => {
    try {
      setLoading(true);
      setError(null);

      if (newStatus === 'published') {
        await quizAdminService.publishQuiz(quizId);
      } else if (newStatus === 'archived') {
        await quizAdminService.archiveQuiz(quizId);
      }

      // Reload quizzes to get updated data
      await loadQuizzes(filters);
    } catch (error) {
      console.error('Failed to update quiz status:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update quiz status'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (
      !window.confirm('Sind Sie sicher, dass Sie dieses Quiz löschen möchten?')
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await quizAdminService.deleteQuiz(quizId);

      // Remove from local state
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete quiz'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
      const duplicatedQuiz = await quizAdminService.duplicateQuiz(quizId);

      // Redirect to edit page for the new quiz
      navigate(`/admin/quizzes/${duplicatedQuiz.id}/edit`);
    } catch (error) {
      console.error('Failed to duplicate quiz:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to duplicate quiz'
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter quizzes based on current filters (client-side filtering for additional refinement)
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch =
      !searchTerm ||
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || quiz.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
    const matchesStatus =
      selectedStatus === 'all' || quiz.status === selectedStatus;

    return (
      matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
    );
  });

  if (loading && quizzes.length === 0) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
              <p className="text-gray-300">Lade Quizze...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
              Quizze verwalten
            </h1>
            <p className="text-gray-300 text-lg">
              Erstellen und verwalten Sie Quizze für Ihre Spieler.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/quizzes/new')}
            disabled={loading}
            className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src="/buttons/Add.png"
              alt="Neues Quiz"
              className="w-5 h-5 inline mr-2"
            />
            Neues Quiz
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-red-400 font-medium">Fehler</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#2D2D3A] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Suchen
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Quiz-Titel oder Beschreibung..."
                className="w-full px-3 py-2 bg-[#1E1E2F] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kategorie
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E1E2F] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Kategorien</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schwierigkeit
              </label>
              <select
                value={selectedDifficulty}
                onChange={e =>
                  setSelectedDifficulty(
                    e.target.value as 'all' | 'easy' | 'medium' | 'hard'
                  )
                }
                className="w-full px-3 py-2 bg-[#1E1E2F] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Schwierigkeiten</option>
                <option value="easy">Leicht</option>
                <option value="medium">Mittel</option>
                <option value="hard">Schwer</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={e =>
                  setSelectedStatus(e.target.value as 'all' | QuizStatus)
                }
                className="w-full px-3 py-2 bg-[#1E1E2F] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Status</option>
                <option value="draft">Entwurf</option>
                <option value="published">Veröffentlicht</option>
                <option value="archived">Archiviert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-300">
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FCC822] mr-2"></div>
                Lade...
              </span>
            ) : (
              `${filteredQuizzes.length} Quiz${filteredQuizzes.length !== 1 ? 'ze' : ''} gefunden`
            )}
          </p>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-[#2D2D3A] hover:bg-[#3A3A4A] rounded-lg text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="h-4 w-4 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582M4.582 9a8.97 8.97 0 0 1 15.356 2.012M19.418 15.012A8.97 8.97 0 0 1 4.582 15M4 16v5h5"
              />
            </svg>
            Aktualisieren
          </button>
        </div>

        {/* Quiz List */}
        {filteredQuizzes.length > 0 ? (
          <QuizList
            quizzes={filteredQuizzes}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293L16 6a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Keine Quizze gefunden
            </h3>
            <p className="text-gray-400 mb-6">
              {Object.values(filters).some(v => v)
                ? 'Keine Quizze entsprechen den aktuellen Filterkriterien.'
                : 'Erstellen Sie Ihr erstes Quiz, um loszulegen.'}
            </p>
            <button
              onClick={() => navigate('/admin/quizzes/new')}
              className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              <img
                src="/buttons/Add.png"
                alt="Neues Quiz"
                className="w-5 h-5 inline mr-2"
              />
              Erstes Quiz erstellen
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
