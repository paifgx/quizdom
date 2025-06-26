import React, { useState } from 'react';
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
  const [_quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [_filters, _setFilters] = useState<QuizFilters>({
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

  // Sample data for demonstration - replace with actual API calls
  const sampleQuizzes: QuizSummary[] = [
    {
      id: '1',
      title: 'IT-Grundlagen Quiz',
      description:
        'Testen Sie Ihr Wissen über grundlegende IT-Konzepte und Terminologie.',
      category: 'Technologie',
      difficulty: 'easy',
      status: 'published',
      questionCount: 20,
      totalPoints: 100,
      estimatedDuration: 15,
      playCount: 156,
      averageScore: 78.5,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      createdBy: 'admin@quizdom.com',
    },
    {
      id: '2',
      title: 'Weltgeschichte: Mittelalter',
      description:
        'Eine Reise durch die faszinierende Epoche des Mittelalters mit all ihren Herrschern, Schlachten und kulturellen Entwicklungen.',
      category: 'Geschichte',
      difficulty: 'medium',
      status: 'draft',
      questionCount: 30,
      totalPoints: 150,
      estimatedDuration: 25,
      playCount: 0,
      averageScore: 0,
      createdAt: '2024-01-18T09:00:00Z',
      updatedAt: '2024-01-22T11:00:00Z',
      createdBy: 'admin@quizdom.com',
    },
    {
      id: '3',
      title: 'Fortgeschrittene Mathematik',
      description:
        'Herausfordernde mathematische Probleme für fortgeschrittene Lernende.',
      category: 'Mathematik',
      difficulty: 'hard',
      status: 'archived',
      questionCount: 25,
      totalPoints: 200,
      estimatedDuration: 30,
      playCount: 89,
      averageScore: 65.2,
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-19T16:00:00Z',
      createdBy: 'admin@quizdom.com',
    },
  ];

  // Filter quizzes based on current filters
  const filteredQuizzes = sampleQuizzes.filter(quiz => {
    const matchesSearch =
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

  const handleStatusChange = async (quizId: string, newStatus: QuizStatus) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      if (newStatus === 'published') {
        await quizAdminService.publishQuiz(quizId);
      } else if (newStatus === 'archived') {
        await quizAdminService.archiveQuiz(quizId);
      }

      // Update local state
      setQuizzes(prev =>
        prev.map(quiz =>
          quiz.id === quizId ? { ...quiz, status: newStatus } : quiz
        )
      );
    } catch (error) {
      console.error('Failed to update quiz status:', error);
      // TODO: Show error notification
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
      // TODO: Replace with actual API call
      await quizAdminService.deleteQuiz(quizId);

      // Remove from local state
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const duplicatedQuiz = await quizAdminService.duplicateQuiz(quizId);

      // Redirect to edit page for the new quiz
      navigate(`/admin/quizzes/${duplicatedQuiz.id}/edit`);
    } catch (error) {
      console.error('Failed to duplicate quiz:', error);
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Technologie',
    'Geschichte',
    'Geographie',
    'Wissenschaft',
    'Mathematik',
    'Kunst & Kultur',
    'Sport',
    'Natur',
  ];

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-4">
              <label
                htmlFor="search"
                className="block text-gray-300 font-medium mb-2"
              >
                Suchen
              </label>
              <input
                type="text"
                id="search"
                placeholder="Quiz-Titel oder Beschreibung suchen..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label
                htmlFor="category"
                className="block text-gray-300 font-medium mb-2"
              >
                Kategorie
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Kategorien</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
                    e.target.value as 'all' | 'easy' | 'medium' | 'hard'
                  )
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Schwierigkeiten</option>
                <option value="easy">Einfach</option>
                <option value="medium">Mittel</option>
                <option value="hard">Schwer</option>
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
              Quizze ({filteredQuizzes.length})
            </h2>
          </div>

          <div className="p-6">
            <QuizList
              quizzes={filteredQuizzes}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822]"></div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
