import { useState } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import { useAuth } from '../contexts/auth';

export function meta() {
  return [
    { title: 'Quizübersicht | Quizdom' },
    { name: 'description', content: 'Übersicht aller verfügbaren Quizzes.' },
  ];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: number;
  duration: string;
  icon: string;
  completed: boolean;
  score?: number;
  popularity: number;
  wisecoinReward: number;
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  const categories = [
    'Wissenschaft',
    'Geschichte',
    'Geographie',
    'Sport',
    'Kunst & Kultur',
    'Technologie',
    'Natur',
    'Mathematik'
  ];

  const availableQuizzes: Quiz[] = [
    {
      id: '1',
      title: 'Grundlagen der Physik',
      description: 'Testen Sie Ihr Wissen über die fundamentalen Gesetze der Physik',
      category: 'Wissenschaft',
      difficulty: 'medium',
      questions: 15,
      duration: '10 Min',
      icon: '/badges/badge_book_1.png',
      completed: true,
      score: 85,
      popularity: 92,
      wisecoinReward: 25,
    },
    {
      id: '2',
      title: 'Weltkrieg Geschichte',
      description: 'Wichtige Ereignisse und Persönlichkeiten der Weltkriege',
      category: 'Geschichte',
      difficulty: 'hard',
      questions: 20,
      duration: '15 Min',
      icon: '/badges/badge_book_2.png',
      completed: false,
      popularity: 88,
      wisecoinReward: 35,
    },
    {
      id: '3',
      title: 'Hauptstädte Europas',
      description: 'Kennen Sie alle Hauptstädte der europäischen Länder?',
      category: 'Geographie',
      difficulty: 'easy',
      questions: 12,
      duration: '8 Min',
      icon: '/badges/badge_book_1.png',
      completed: true,
      score: 100,
      popularity: 95,
      wisecoinReward: 20,
    },
    {
      id: '4',
      title: 'Fußball-Weltmeisterschaften',
      description: 'Alles über die FIFA Weltmeisterschaft seit 1930',
      category: 'Sport',
      difficulty: 'medium',
      questions: 18,
      duration: '12 Min',
      icon: '/badges/badge_book_1.png',
      completed: false,
      popularity: 78,
      wisecoinReward: 30,
    },
    {
      id: '5',
      title: 'Berühmte Gemälde',
      description: 'Erkennen Sie die Meisterwerke der Kunstgeschichte?',
      category: 'Kunst & Kultur',
      difficulty: 'hard',
      questions: 16,
      duration: '11 Min',
      icon: '/badges/badge_book_2.png',
      completed: false,
      popularity: 71,
      wisecoinReward: 40,
    },
    {
      id: '6',
      title: 'Grundlagen der Programmierung',
      description: 'Testen Sie Ihr Wissen über Programmierkonzepte',
      category: 'Technologie',
      difficulty: 'easy',
      questions: 14,
      duration: '9 Min',
      icon: '/badges/badge_book_1.png',
      completed: true,
      score: 78,
      popularity: 85,
      wisecoinReward: 25,
    },
  ];

  const filteredQuizzes = availableQuizzes.filter(quiz => {
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'title':
        return a.title.localeCompare(b.title);
      case 'reward':
        return b.wisecoinReward - a.wisecoinReward;
      default:
        return 0;
    }
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

  const getCompletedCount = () => {
    return availableQuizzes.filter(quiz => quiz.completed).length;
  };

  const getAverageScore = () => {
    const completedQuizzes = availableQuizzes.filter(quiz => quiz.completed && quiz.score);
    if (completedQuizzes.length === 0) return 0;
    const totalScore = completedQuizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
    return Math.round(totalScore / completedQuizzes.length);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
              Quizübersicht
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Entdecken Sie spannende Quizzes aus verschiedenen Kategorien und testen Sie Ihr Wissen.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-[#FCC822] mb-2">
                {availableQuizzes.length}
              </div>
              <div className="text-gray-300">Verfügbare Quizzes</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {getCompletedCount()}
              </div>
              <div className="text-gray-300">Abgeschlossen</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-[#FCC822] mb-2">
                {getAverageScore()}%
              </div>
              <div className="text-gray-300">Durchschnittspunktzahl</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
              <div className="flex items-center justify-center space-x-2">
                <img src="/wisecoin/wisecoin.png" alt="Wisecoins" className="h-6 w-6" />
                <div className="text-3xl font-bold text-[#FCC822]">
                  {user?.wisecoins || 0}
                </div>
              </div>
              <div className="text-gray-300">Ihre Wisecoins</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-gray-300 font-medium mb-2">
                  Suchen
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Quiz suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-gray-300 font-medium mb-2">
                  Kategorie
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                >
                  <option value="all">Alle Kategorien</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-gray-300 font-medium mb-2">
                  Schwierigkeit
                </label>
                <select
                  id="difficulty"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                >
                  <option value="all">Alle Schwierigkeiten</option>
                  <option value="easy">Einfach</option>
                  <option value="medium">Mittel</option>
                  <option value="hard">Schwer</option>
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="block text-gray-300 font-medium mb-2">
                  Sortieren nach
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                >
                  <option value="popularity">Beliebtheit</option>
                  <option value="difficulty">Schwierigkeit</option>
                  <option value="title">Titel</option>
                  <option value="reward">Belohnung</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`bg-gray-800 bg-opacity-50 rounded-xl p-6 border transition-all duration-300 hover:scale-105 cursor-pointer ${
                  quiz.completed 
                    ? 'border-green-500 shadow-lg shadow-green-500/20' 
                    : 'border-gray-700 hover:border-[#FCC822]'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    console.log(`Starting quiz: ${quiz.title}`);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={quiz.icon}
                      alt={quiz.category}
                      className="h-12 w-12"
                      onError={(e) => {
                        e.currentTarget.src = '/badges/badge_book_1.png';
                      }}
                    />
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                        {getDifficultyLabel(quiz.difficulty)}
                      </span>
                    </div>
                  </div>
                  {quiz.completed && (
                    <div className="flex items-center space-x-2">
                      <img src="/buttons/Accept.png" alt="Completed" className="h-5 w-5" />
                      <span className="text-green-400 text-sm font-medium">{quiz.score}%</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {quiz.title}
                </h3>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {quiz.description}
                </p>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Kategorie:</span>
                    <span className="text-[#FCC822]">{quiz.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fragen:</span>
                    <span>{quiz.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dauer:</span>
                    <span>{quiz.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Belohnung:</span>
                    <div className="flex items-center space-x-1">
                      <img src="/wisecoin/wisecoin.png" alt="Wisecoins" className="h-4 w-4" />
                      <span className="text-[#FCC822]">{quiz.wisecoinReward}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#FCC822] rounded-full"></div>
                    <span className="text-gray-400 text-sm">{quiz.popularity}% Beliebtheit</span>
                  </div>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    quiz.completed
                      ? 'bg-green-600 text-green-100 hover:bg-green-500'
                      : 'btn-gradient'
                  }`}>
                    {quiz.completed ? 'Wiederholen' : 'Starten'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {sortedQuizzes.length === 0 && (
            <div className="text-center py-12">
              <img src="/badges/badge_book_1.png" alt="No quizzes" className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg">
                Keine Quizzes gefunden.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Ändern Sie Ihre Suchkriterien oder wählen Sie eine andere Kategorie.
              </p>
            </div>
          )}
        </div>
    </ProtectedRoute>
  );
} 