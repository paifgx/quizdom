import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import { NineSlicePanel } from '../components/nine-slice-quiz';

export function meta() {
  return [
    { title: 'Topic Detail | Quizdom' },
    {
      name: 'description',
      content: 'Detailed view of quiz topic with questions and progress.',
    },
  ];
}

interface TopicQuestion {
  id: string;
  number: number;
  isBookmarked: boolean;
  isCompleted: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface TopicData {
  id: string;
  title: string;
  description: string;
  image: string;
  totalQuestions: number;
  completedQuestions: number;
  bookmarkedQuestions: number;
  stars: number;
  questions: TopicQuestion[];
  isFavorite: boolean;
  wisecoinReward: number;
}

// Fantasy-themed difficulty names based on star ratings
const getDifficultyName = (stars: number): string => {
  switch (stars) {
    case 1:
      return 'Anfänger';
    case 2:
      return 'Lehrling';
    case 3:
      return 'Geselle';
    case 4:
      return 'Meister';
    case 5:
      return 'Großmeister';
    default:
      return 'Anfänger';
  }
};

// Mock data - replace with actual API call
const getTopicData = (topicId: string): TopicData => {
  const topics: Record<string, TopicData> = {
    'it-projectmanagement': {
      id: 'it-projectmanagement',
      title: 'IT-Projektmanagement',
      description:
        'Comprehensive questions about IT project management, methodologies, and best practices.',
      image: '/topics/it-project-management.png',
      totalQuestions: 150,
      completedQuestions: 10,
      bookmarkedQuestions: 2,
      stars: 2, // Medium difficulty (1-3 stars for easy, 2-4 for medium, 3-5 for hard)
      questions: [
        {
          id: '1',
          number: 1,
          isBookmarked: true,
          isCompleted: true,
          difficulty: 'easy',
        },
        {
          id: '2',
          number: 2,
          isBookmarked: true,
          isCompleted: false,
          difficulty: 'medium',
        },
      ],
      isFavorite: true,
      wisecoinReward: 200,
    },
    math: {
      id: 'math',
      title: 'Mathematics',
      description: 'Mathematische Grundlagen und fortgeschrittene Konzepte',
      image: '/topics/math.png',
      totalQuestions: 100,
      completedQuestions: 0,
      bookmarkedQuestions: 0,
      stars: 4, // Hard difficulty
      questions: [],
      isFavorite: false,
      wisecoinReward: 250,
    },
  };

  return topics[topicId] || topics['it-projectmanagement'];
};

export default function TopicDetailPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  // Initialize state first, before any early returns
  const [topic, setTopic] = useState(() => {
    if (!topicId) return getTopicData('it-projectmanagement');
    return getTopicData(topicId);
  });

  // Toggle favorite function
  const toggleFavorite = () => {
    setTopic(prevTopic => ({
      ...prevTopic,
      isFavorite: !prevTopic.isFavorite,
    }));
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  if (!topicId) {
    return <div>Topic not found</div>;
  }

  return (
    <ProtectedRoute>
      <div>
        {/* Title Tile */}
        <div className="mb-6 lg:mb-8">
          <div className="relative">
            <div className="w-full px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gray-800/80 border border-gray-600 rounded-xl backdrop-blur-sm flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-[#FCC822]">
                {topic.title}
              </h1>
              <div className="flex items-center space-x-2">
                {/* Favorite Button */}
                <button
                  onClick={toggleFavorite}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title={
                    topic.isFavorite
                      ? 'Von Favoriten entfernen'
                      : 'Zu Favoriten hinzufügen'
                  }
                >
                  <svg
                    className={`h-5 w-5 transition-colors duration-200 ${
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

                {/* Close/Delete Button */}
                <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                  <img
                    src="/buttons/Delete.png"
                    alt="Delete"
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm mb-6 flex flex-col lg:flex-row relative">
          {/* Topic Image */}
          <div className="flex-shrink-0">
            <img
              src={topic.image}
              alt={topic.title}
              className="h-48 w-full lg:h-full lg:w-64 object-cover rounded-t-xl lg:rounded-l-xl lg:rounded-t-none border-b-2 lg:border-b-0 lg:border-r-2 border-[#FCC822]"
            />
          </div>

          {/* Content Area - Right Side */}
          <div className="flex-grow p-4 lg:p-6 flex flex-col">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-4 lg:space-y-0">
              {/* Description */}
              <div className="flex-1 lg:pr-8">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {topic.description}
                </p>
              </div>

              {/* Progress */}
              <div className="flex flex-col items-start lg:items-end space-y-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <img
                      key={index}
                      src={
                        index < topic.stars
                          ? '/stars/star_full.png'
                          : '/stars/star_empty.png'
                      }
                      alt={`Star ${index + 1}`}
                      className="h-6 w-6 lg:h-8 lg:w-8"
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  Schwierigkeit: {getDifficultyName(topic.stars)}
                </div>
                <div className="text-sm text-gray-400">
                  {topic.completedQuestions}/{topic.totalQuestions} Fragen
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <img
                    src="/wisecoin/wisecoin.png"
                    alt="Wisecoins"
                    className="h-4 w-4"
                  />
                  <span className="text-[#FCC822] font-medium">
                    {topic.wisecoinReward} Wisecoin
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Achievements and Play Button */}
            <div className="mt-auto flex flex-col lg:flex-row lg:justify-between lg:items-end space-y-4 lg:space-y-0">
              {/* Achievements */}
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-semibold text-gray-400">Erfolge</h3>
                <div className="flex items-center space-x-2 lg:space-x-3 flex-wrap gap-2">
                  <img
                    src="/badges/badge_1_64x64.png"
                    alt="First Steps"
                    className="h-6 w-6 lg:h-8 lg:w-8"
                    title="First Steps"
                  />
                  <img
                    src="/badges/badge_2_64x64.png"
                    alt="Quick Learner"
                    className="h-6 w-6 lg:h-8 lg:w-8 opacity-40"
                    title="Quick Learner"
                  />
                  <img
                    src="/badges/badge_3_64x64.png"
                    alt="Knowledge Master"
                    className="h-6 w-6 lg:h-8 lg:w-8 opacity-40"
                    title="Knowledge Master"
                  />
                  <img
                    src="/badges/badge_book_1.png"
                    alt="Bookworm I"
                    className="h-6 w-6 lg:h-8 lg:w-8"
                    title="Bookworm I"
                  />
                  <img
                    src="/badges/badge_book_2.png"
                    alt="Bookworm II"
                    className="h-6 w-6 lg:h-8 lg:w-8 opacity-40"
                    title="Bookworm II"
                  />
                </div>
              </div>

              {/* Play Button */}
              <div className="w-full lg:w-32">
                <NineSlicePanel
                  className="cursor-pointer hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    // Navigate to game modes with topic context
                    navigate(`/game-modes?topic=${topic.id}`);
                  }}
                >
                  <span className="text-base lg:text-lg font-bold">PLAY</span>
                </NineSlicePanel>
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarked Questions Section */}
        <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-600 backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              Gemerkte Fragen: {topic.bookmarkedQuestions}
            </h2>
            <Link
              to={`/quizzes?topic=${topic.id}&bookmarked=true`}
              className="text-[#FCC822] hover:text-[#FFCD2E] text-sm font-medium transition-colors"
            >
              Alle anzeigen
            </Link>
          </div>

          {/* Question Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topic.questions.map(question => (
              <div
                key={question.id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-[#FCC822] transition-all duration-200 cursor-pointer hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl font-bold text-[#FCC822]">
                    {question.number}
                  </div>
                  {question.isBookmarked && (
                    <img
                      src="/stars/star_full.png"
                      alt="Bookmarked"
                      className="h-5 w-5"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      question.difficulty === 'easy'
                        ? 'bg-green-500/20 text-green-400'
                        : question.difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {question.difficulty}
                  </div>

                  {question.isCompleted && (
                    <img
                      src="/buttons/Accept.png"
                      alt="Completed"
                      className="h-4 w-4"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Navigation */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 text-[#FCC822] hover:text-[#FFCD2E] transition-colors font-medium"
          >
            <img src="/buttons/Left.png" alt="Back" className="h-5 w-5" />
            <span>Zurück</span>
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
