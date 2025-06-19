import React, { useState } from 'react';
import { Link } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import { useAuth } from '../contexts/auth';

export function meta() {
  return [
    { title: 'Topics Overview | Quizdom' },
    {
      name: 'description',
      content: 'Übersicht aller verfügbaren Quiz-Themen.',
    },
  ];
}

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  completedQuestions: number;
  image: string;
  stars: number;
  maxStars: number;
  popularity: number;
  wisecoinReward: number;
  isCompleted: boolean;
  isFavorite: boolean;
}

export default function TopicsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [topics, setTopics] = useState<Topic[]>([]);

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

  // Initialize topics data with useEffect or direct initialization
  React.useEffect(() => {
    setTopics([
      {
        id: 'it-projectmanagement',
        title: 'IT-Projektmanagement',
        description:
          'Comprehensive questions about IT project management, methodologies, and best practices.',
        category: 'Technologie',
        difficulty: 'medium',
        totalQuestions: 150,
        completedQuestions: 10,
        image: '/topics/it-projectmanagement.png',
        stars: 1,
        maxStars: 4,
        popularity: 85,
        wisecoinReward: 200,
        isCompleted: false,
        isFavorite: true,
      },
      {
        id: 'math',
        title: 'Mathematik',
        description:
          'Mathematische Grundlagen und fortgeschrittene Konzepte für alle Lernstufen.',
        category: 'Mathematik',
        difficulty: 'hard',
        totalQuestions: 100,
        completedQuestions: 0,
        image: '/topics/math.png',
        stars: 0,
        maxStars: 4,
        popularity: 92,
        wisecoinReward: 250,
        isCompleted: false,
        isFavorite: false,
      },
      {
        id: 'physics',
        title: 'Physik',
        description: 'Grundlagen der Physik - von Mechanik bis Quantenphysik.',
        category: 'Wissenschaft',
        difficulty: 'medium',
        totalQuestions: 120,
        completedQuestions: 85,
        image: '/topics/physics.png',
        stars: 3,
        maxStars: 4,
        popularity: 88,
        wisecoinReward: 180,
        isCompleted: false,
        isFavorite: true,
      },
      {
        id: 'world-history',
        title: 'Weltgeschichte',
        description:
          'Wichtige Ereignisse und Persönlichkeiten der Weltgeschichte.',
        category: 'Geschichte',
        difficulty: 'medium',
        totalQuestions: 200,
        completedQuestions: 200,
        image: '/topics/history.png',
        stars: 4,
        maxStars: 4,
        popularity: 90,
        wisecoinReward: 300,
        isCompleted: true,
        isFavorite: false,
      },
      {
        id: 'geography',
        title: 'Geographie',
        description:
          'Länder, Hauptstädte, Flüsse und geografische Besonderheiten.',
        category: 'Geographie',
        difficulty: 'easy',
        totalQuestions: 80,
        completedQuestions: 45,
        image: '/topics/geography.png',
        stars: 2,
        maxStars: 4,
        popularity: 95,
        wisecoinReward: 150,
        isCompleted: false,
        isFavorite: false,
      },
      {
        id: 'art-culture',
        title: 'Kunst & Kultur',
        description:
          'Meisterwerke der Kunstgeschichte und kulturelle Entwicklungen.',
        category: 'Kunst & Kultur',
        difficulty: 'hard',
        totalQuestions: 90,
        completedQuestions: 15,
        image: '/topics/art.png',
        stars: 1,
        maxStars: 4,
        popularity: 71,
        wisecoinReward: 220,
        isCompleted: false,
        isFavorite: false,
      },
    ]);
  }, []);

  // Toggle favorite function
  const toggleFavorite = (topicId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation when clicking favorite button
    setTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === topicId
          ? { ...topic, isFavorite: !topic.isFavorite }
          : topic
      )
    );
  };

  const filteredTopics = topics.filter(topic => {
    const matchesCategory =
      selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'difficulty': {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      case 'title':
        return a.title.localeCompare(b.title);
      case 'progress':
        return (
          b.completedQuestions / b.totalQuestions -
          a.completedQuestions / a.totalQuestions
        );
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

  const getCompletedTopicsCount = () => {
    return topics.filter(topic => topic.isCompleted).length;
  };

  const getFavoriteTopicsCount = () => {
    return topics.filter(topic => topic.isFavorite).length;
  };

  const getTotalProgress = () => {
    const totalQuestions = topics.reduce(
      (sum, topic) => sum + topic.totalQuestions,
      0
    );
    const completedQuestions = topics.reduce(
      (sum, topic) => sum + topic.completedQuestions,
      0
    );
    return totalQuestions > 0
      ? Math.round((completedQuestions / totalQuestions) * 100)
      : 0;
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
            Themenübersicht
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Entdecken Sie spannende Themen aus verschiedenen Kategorien und
            testen Sie Ihr Wissen.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-3xl font-bold text-[#FCC822] mb-2">
              {topics.length}
            </div>
            <div className="text-gray-300">Verfügbare Themen</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {getFavoriteTopicsCount()}
            </div>
            <div className="text-gray-300">Meine Favoriten</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {getCompletedTopicsCount()}
            </div>
            <div className="text-gray-300">Abgeschlossen</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-3xl font-bold text-[#FCC822] mb-2">
              {getTotalProgress()}%
            </div>
            <div className="text-gray-300">Gesamtfortschritt</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700">
            <div className="flex items-center justify-center space-x-2">
              <img
                src="/wisecoin/wisecoin.png"
                alt="Wisecoins"
                className="h-6 w-6"
              />
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
              <label
                htmlFor="search"
                className="block text-gray-300 font-medium mb-2"
              >
                Suchen
              </label>
              <input
                type="text"
                id="search"
                placeholder="Thema suchen..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              />
            </div>

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

            <div>
              <label
                htmlFor="sort"
                className="block text-gray-300 font-medium mb-2"
              >
                Sortieren nach
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="popularity">Beliebtheit</option>
                <option value="difficulty">Schwierigkeit</option>
                <option value="title">Titel</option>
                <option value="progress">Fortschritt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTopics.map(topic => (
            <Link
              key={topic.id}
              to={`/topics/${topic.id}`}
              className={`bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 block ${
                topic.isCompleted
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : topic.isFavorite
                    ? 'border-red-500 shadow-lg shadow-red-500/20 hover:border-red-400'
                    : 'border-gray-700 hover:border-[#FCC822]'
              }`}
            >
              {/* Banner Image */}
              <div className="relative h-32 w-full">
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="h-full w-full object-cover"
                  onError={e => {
                    e.currentTarget.src = '/badges/badge_book_1.png';
                  }}
                />
                {/* Difficulty Badge - Positioned over banner */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}
                  >
                    {getDifficultyLabel(topic.difficulty)}
                  </span>
                </div>
                {/* Favorite Button - Positioned over banner */}
                <button
                  onClick={event => toggleFavorite(topic.id, event)}
                  className="absolute top-3 right-3 p-2 bg-gray-900 bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200"
                  title={
                    topic.isFavorite
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                >
                  <svg
                    className={`h-4 w-4 transition-colors duration-200 ${
                      topic.isFavorite
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                    viewBox="0 0 24 24"
                    fill={topic.isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                {/* Completion Badge - Positioned over banner */}
                {topic.isCompleted && (
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2 bg-gray-900 bg-opacity-80 rounded-full px-2 py-1">
                    <img
                      src="/buttons/Accept.png"
                      alt="Completed"
                      className="h-4 w-4"
                    />
                    <span className="text-green-400 text-xs font-medium">
                      Abgeschlossen
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {topic.title}
                </h3>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {topic.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Fortschritt</span>
                    <span>
                      {getProgressPercentage(
                        topic.completedQuestions,
                        topic.totalQuestions
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-[#FCC822] h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${getProgressPercentage(topic.completedQuestions, topic.totalQuestions)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Kategorie:</span>
                    <span className="text-[#FCC822]">{topic.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fragen:</span>
                    <span>
                      {topic.completedQuestions}/{topic.totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sterne:</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(topic.maxStars)].map((_, index) => (
                        <img
                          key={index}
                          src={
                            index < topic.stars
                              ? '/stars/star_full.png'
                              : '/stars/star_empty.png'
                          }
                          alt={`Star ${index + 1}`}
                          className="h-3 w-3"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Belohnung:</span>
                    <div className="flex items-center space-x-1">
                      <img
                        src="/wisecoin/wisecoin.png"
                        alt="Wisecoins"
                        className="h-4 w-4"
                      />
                      <span className="text-[#FCC822]">
                        {topic.wisecoinReward}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-700">
                  <div className="text-[#FCC822] text-sm font-medium">
                    Thema erkunden →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {sortedTopics.length === 0 && (
          <div className="text-center py-12">
            <img
              src="/badges/badge_book_1.png"
              alt="No topics"
              className="h-16 w-16 mx-auto mb-4 opacity-50"
            />
            <p className="text-gray-400 text-lg">Keine Themen gefunden.</p>
            <p className="text-gray-500 text-sm mt-2">
              Ändern Sie Ihre Suchkriterien oder wählen Sie eine andere
              Kategorie.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
