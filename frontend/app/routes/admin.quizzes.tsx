import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import { QuizList } from '../components/admin/quiz-list';
import { quizAdminService } from '../services/quiz-admin';
import type {
  Quiz,
  QuizSummary,
  QuizStatus,
  QuizDifficulty,
} from '../types/quiz';

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

  // State management
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'all' | QuizDifficulty
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | QuizStatus>(
    'all'
  );

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        search: searchTerm,
        difficulty:
          selectedDifficulty === 'all' ? undefined : selectedDifficulty,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      };
      const quizzesData = await quizAdminService.getQuizzes(filters);
      setQuizzes(quizzesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDifficulty, selectedStatus]);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleStatusChange = async (quizId: string, newStatus: QuizStatus) => {
    try {
      setError(null);
      let updatedQuiz: Quiz;

      if (newStatus === 'published') {
        updatedQuiz = await quizAdminService.publishQuiz(quizId);
      } else if (newStatus === 'archived') {
        updatedQuiz = await quizAdminService.archiveQuiz(quizId);
      } else if (newStatus === 'draft') {
        updatedQuiz = await quizAdminService.reactivateQuiz(quizId);
      } else {
        loadQuizzes();
        return;
      }

      // Update local state with the response from the server
      setQuizzes(prev =>
        prev.map(quiz =>
          quiz.id === quizId
            ? {
                ...quiz, // Retain fields like playCount from the old summary
                id: updatedQuiz.id,
                title: updatedQuiz.title,
                description: updatedQuiz.description,
                difficulty: updatedQuiz.difficulty,
                status: updatedQuiz.status,
                questionCount: updatedQuiz.questions.length,
                totalPoints: updatedQuiz.totalPoints,
                estimatedDuration: updatedQuiz.estimatedDuration,
                createdAt: updatedQuiz.createdAt,
                updatedAt: updatedQuiz.updatedAt,
                createdBy: updatedQuiz.createdBy,
              }
            : quiz
        )
      );
    } catch (err) {
      console.error('Failed to update quiz status:', err);
      setError(
        'Fehler beim Aktualisieren des Quiz-Status. Bitte versuchen Sie es erneut.'
      );
    }
  };

  const handleDelete = async (quizId: string) => {
    if (
      !window.confirm('Sind Sie sicher, dass Sie dieses Quiz löschen möchten?')
    ) {
      return;
    }

    try {
      await quizAdminService.deleteQuiz(quizId);

      // Remove from local state
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      window.alert(
        'Fehler beim Löschen des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      setError(null);
      const duplicatedQuiz = await quizAdminService.duplicateQuiz(quizId);

      // Redirect to edit page for the new quiz
      navigate(`/admin/quizzes/${duplicatedQuiz.id}/edit`);
    } catch (err) {
      console.error('Failed to duplicate quiz:', err);
      setError(
        'Fehler beim Duplizieren des Quiz. Bitte versuchen Sie es erneut.'
      );
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
              <p className="text-gray-300">Lade Quizze...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-xl p-6 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={loadQuizzes}
              className="btn-gradient px-4 py-2 rounded-lg font-medium"
            >
              Erneut versuchen
            </button>
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
            className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            <img
              src="/buttons/Add.png"
              alt="Add"
              className="inline h-5 w-5 mr-2"
            />
            Neues Quiz
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label
                htmlFor="search"
                className="block text-gray-300 font-medium mb-2"
              >
                Suchen
              </label>
              <input
                type="text"
                id="search"
                placeholder="Quiz-Titel oder Beschreibung..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label
                htmlFor="difficulty"
                className="block text-gray-300 font-medium mb-2"
              >
                Schwierigkeit
              </label>
              <select
                id="difficulty"
                value={selectedDifficulty}
                onChange={e =>
                  setSelectedDifficulty(
                    e.target.value === 'all'
                      ? 'all'
                      : (parseInt(e.target.value) as QuizDifficulty)
                  )
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Schwierigkeiten</option>
                <option value={1}>1 - Anfänger</option>
                <option value={2}>2 - Lehrling</option>
                <option value={3}>3 - Geselle</option>
                <option value={4}>4 - Meister</option>
                <option value={5}>5 - Großmeister</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label
                htmlFor="status"
                className="block text-gray-300 font-medium mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={e =>
                  setSelectedStatus(e.target.value as 'all' | QuizStatus)
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Status</option>
                <option value="draft">Entwurf</option>
                <option value="published">Veröffentlicht</option>
                <option value="archived">Archiviert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-[#FCC822]">
              Quizze ({quizzes.length})
            </h2>
          </div>

          {quizzes.length > 0 ? (
            <QuizList
              quizzes={quizzes}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ) : (
            <div className="p-12 text-center">
              <img
                src="/buttons/Filter.png"
                alt="No results"
                className="h-16 w-16 mx-auto mb-4 opacity-50"
              />
              <p className="text-gray-400 text-lg">Keine Quizze gefunden.</p>
              <p className="text-gray-500 text-sm mt-2">
                {quizzes.length === 0
                  ? 'Erstellen Sie Ihr erstes Quiz, um zu beginnen.'
                  : 'Ändern Sie Ihre Suchkriterien oder erstellen Sie neue Quizze.'}
              </p>
              {quizzes.length === 0 && (
                <button
                  onClick={() => navigate('/admin/quizzes/new')}
                  className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 mt-4"
                >
                  <img
                    src="/buttons/Add.png"
                    alt="Add"
                    className="inline h-5 w-5 mr-2"
                  />
                  Erstes Quiz erstellen
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
