import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';

export function meta() {
  return [
    { title: 'Fragenbank | Quizdom Admin' },
    {
      name: 'description',
      content: 'Verwalten Sie Ihre zentrale Fragenbank für Quiz-Erstellung.',
    },
  ];
}

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
  createdAt: string;
  createdBy: string;
}

export default function AdminQuestionsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = [
    'Wissenschaft',
    'Geschichte',
    'Geographie',
    'Sport',
    'Kunst & Kultur',
    'Technologie',
    'Natur',
    'Mathematik',
  ];

  const sampleQuestions: Question[] = [
    {
      id: '1',
      text: 'Welcher Planet ist der größte in unserem Sonnensystem?',
      category: 'Wissenschaft',
      difficulty: 'easy',
      answers: [
        { text: 'Jupiter', isCorrect: true },
        { text: 'Saturn', isCorrect: false },
        { text: 'Neptun', isCorrect: false },
        { text: 'Uranus', isCorrect: false },
      ],
      createdAt: '2024-01-15',
      createdBy: 'admin@quizdom.com',
    },
    {
      id: '2',
      text: 'In welchem Jahr fiel die Berliner Mauer?',
      category: 'Geschichte',
      difficulty: 'medium',
      answers: [
        { text: '1987', isCorrect: false },
        { text: '1989', isCorrect: true },
        { text: '1991', isCorrect: false },
        { text: '1993', isCorrect: false },
      ],
      createdAt: '2024-01-14',
      createdBy: 'admin@quizdom.com',
    },
    {
      id: '3',
      text: 'Was ist die chemische Formel für Wasser?',
      category: 'Wissenschaft',
      difficulty: 'easy',
      answers: [
        { text: 'H2O', isCorrect: true },
        { text: 'CO2', isCorrect: false },
        { text: 'NaCl', isCorrect: false },
        { text: 'O2', isCorrect: false },
      ],
      createdAt: '2024-01-13',
      createdBy: 'admin@quizdom.com',
    },
  ];

  const filteredQuestions = sampleQuestions.filter(question => {
    const matchesSearch =
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || question.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      question.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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
                placeholder="Frage oder Kategorie suchen..."
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
                        {question.category}
                      </span>
                    </div>

                    <h3 className="text-white font-medium text-lg mb-3">
                      {question.text}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {question.answers.map((answer, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-lg text-sm ${
                            answer.isCorrect
                              ? 'bg-green-600 bg-opacity-20 text-green-300 border border-green-600'
                              : 'bg-gray-600 bg-opacity-20 text-gray-300 border border-gray-600'
                          }`}
                        >
                          {answer.text}
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
                      Erstellt am {question.createdAt} von {question.createdBy}
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
                      className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                      title="Löschen"
                    >
                      <img
                        src="/buttons/Delete.png"
                        alt="Delete"
                        className="h-5 w-5"
                      />
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
                Ändern Sie Ihre Suchkriterien oder fügen Sie neue Fragen hinzu.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredQuestions.length > 0 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                <img
                  src="/buttons/Left.png"
                  alt="Previous"
                  className="h-4 w-4"
                />
              </button>
              <button className="px-4 py-2 bg-[#FCC822] text-[#061421] rounded-lg font-medium">
                1
              </button>
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                2
              </button>
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                3
              </button>
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                <img src="/buttons/Right.png" alt="Next" className="h-4 w-4" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
