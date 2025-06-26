import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import {
  questionAdminService,
  type Question,
  type Topic,
} from '../services/question-admin';

export function meta() {
  return [
    { title: 'Fragenbank | Quizdom Admin' },
    {
      name: 'description',
      content: 'Verwalten Sie Ihre zentrale Fragenbank für Quiz-Erstellung.',
    },
  ];
}

export default function AdminQuestionsPage() {
  const navigate = useNavigate();

  // State management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load questions and topics in parallel
      const [questionsData, topicsData] = await Promise.all([
        questionAdminService.getQuestions(),
        questionAdminService.getTopics(),
      ]);

      setQuestions(questionsData);
      setTopics(topicsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredQuestions = questions.filter(question => {
    const matchesSearch =
      searchTerm === '' ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.explanation &&
        question.explanation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTopic =
      selectedTopicId === 'all' || question.topicId === selectedTopicId;
    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      question.difficulty === selectedDifficulty;

    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const handleDelete = async (questionId: string) => {
    if (
      !window.confirm('Sind Sie sicher, dass Sie diese Frage löschen möchten?')
    ) {
      return;
    }

    try {
      setDeleting(questionId);
      await questionAdminService.deleteQuestion(questionId);

      // Remove from local state
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (err) {
      console.error('Failed to delete question:', err);
      window.alert(
        'Fehler beim Löschen der Frage. Bitte versuchen Sie es erneut.'
      );
    } finally {
      setDeleting(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-600 text-green-100';
      case 'medium':
        return 'bg-yellow-600 text-yellow-100';
      case 'hard':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Einfach';
      case 'medium':
        return 'Mittel';
      case 'hard':
        return 'Schwer';
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
              <p className="text-gray-300">Lade Fragen...</p>
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
              onClick={loadData}
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
              Fragenbank
            </h1>
            <p className="text-gray-300 text-lg">
              Zentrale Verwaltung aller Fragen für die Quiz-Erstellung.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/questions/new')}
            className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            <img
              src="/buttons/Add.png"
              alt="Add"
              className="inline h-5 w-5 mr-2"
            />
            Neue Frage
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="block text-gray-300 font-medium mb-2"
              >
                Suchen
              </label>
              <input
                type="text"
                id="search"
                placeholder="Frage oder Thema suchen..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              />
            </div>

            {/* Topic Filter */}
            <div>
              <label
                htmlFor="topic"
                className="block text-gray-300 font-medium mb-2"
              >
                Thema
              </label>
              <select
                id="topic"
                value={selectedTopicId}
                onChange={e => setSelectedTopicId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Themen</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
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
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Schwierigkeiten</option>
                <option value="easy">Einfach</option>
                <option value="medium">Mittel</option>
                <option value="hard">Schwer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-[#FCC822]">
              Fragen ({filteredQuestions.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {filteredQuestions.map(question => (
              <div
                key={question.id}
                className="p-6 hover:bg-gray-700 hover:bg-opacity-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                      >
                        {getDifficultyLabel(question.difficulty)}
                      </span>
                      <span className="px-3 py-1 bg-[#FCC822] bg-opacity-20 text-[#FCC822] rounded-full text-xs font-medium">
                        {question.topicTitle}
                      </span>
                    </div>

                    <h3 className="text-white font-medium text-lg mb-3">
                      {question.content}
                    </h3>

                    {question.explanation && (
                      <p className="text-gray-400 text-sm mb-3 italic">
                        {question.explanation}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {question.answers.map(answer => (
                        <div
                          key={answer.id}
                          className={`p-2 rounded-lg text-sm ${
                            answer.isCorrect
                              ? 'bg-green-600 bg-opacity-20 text-green-300 border border-green-600'
                              : 'bg-gray-600 bg-opacity-20 text-gray-300 border border-gray-600'
                          }`}
                        >
                          {answer.content}
                          {answer.isCorrect && (
                            <img
                              src="/buttons/Accept.png"
                              alt="Correct"
                              className="inline h-4 w-4 ml-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-gray-400">
                      Erstellt am{' '}
                      {new Date(question.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/questions/${question.id}`)
                      }
                      className="p-2 text-[#FCC822] hover:bg-[#FCC822] hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                      title="Bearbeiten"
                    >
                      <img
                        src="/buttons/Settings.png"
                        alt="Edit"
                        className="h-5 w-5"
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      disabled={deleting === question.id}
                      className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Löschen"
                    >
                      {deleting === question.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
                      ) : (
                        <img
                          src="/buttons/Delete.png"
                          alt="Delete"
                          className="h-5 w-5"
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="p-12 text-center">
              <img
                src="/buttons/Filter.png"
                alt="No results"
                className="h-16 w-16 mx-auto mb-4 opacity-50"
              />
              <p className="text-gray-400 text-lg">Keine Fragen gefunden.</p>
              <p className="text-gray-500 text-sm mt-2">
                {questions.length === 0
                  ? 'Fügen Sie neue Fragen hinzu, um zu beginnen.'
                  : 'Ändern Sie Ihre Suchkriterien oder fügen Sie neue Fragen hinzu.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
