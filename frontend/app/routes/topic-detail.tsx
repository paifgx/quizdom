import React from 'react';
import { useParams, Link } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';

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
  maxStars: number;
  questions: TopicQuestion[];
}

// Mock data - replace with actual API call
const getTopicData = (topicId: string): TopicData => {
  const topics: Record<string, TopicData> = {
    'it-projektmanagement': {
      id: 'it-projektmanagement',
      title: 'IT-Projektmanagement',
      description:
        'Comprehensive questions about IT project management, methodologies, and best practices.',
      image: '/topics/it_projektmanagement.png',
      totalQuestions: 150,
      completedQuestions: 10,
      bookmarkedQuestions: 10,
      stars: 1,
      maxStars: 4,
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
        {
          id: '3',
          number: 3,
          isBookmarked: false,
          isCompleted: false,
          difficulty: 'hard',
        },
      ],
    },
    wissenschaft: {
      id: 'wissenschaft',
      title: 'Wissenschaft',
      description:
        'General science questions covering physics, chemistry, biology, and more.',
      image: '/topics/wissenschaft.png',
      totalQuestions: 200,
      completedQuestions: 25,
      bookmarkedQuestions: 8,
      stars: 2,
      maxStars: 4,
      questions: [
        {
          id: '1',
          number: 1,
          isBookmarked: true,
          isCompleted: true,
          difficulty: 'medium',
        },
        {
          id: '2',
          number: 2,
          isBookmarked: false,
          isCompleted: true,
          difficulty: 'easy',
        },
        {
          id: '3',
          number: 3,
          isBookmarked: true,
          isCompleted: false,
          difficulty: 'hard',
        },
      ],
    },
  };

  return topics[topicId] || topics['it-projektmanagement'];
};

export default function TopicDetailPage() {
  const { topicId } = useParams();

  if (!topicId) {
    return <div>Topic not found</div>;
  }

  const topic = getTopicData(topicId);

  return (
    <ProtectedRoute>
      <div>
        {/* Header Section */}
        <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-600 backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#FCC822]">{topic.title}</h1>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <img src="/buttons/Delete.png" alt="Delete" className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Progress */}
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {topic.completedQuestions}/{topic.totalQuestions}
                </div>
                <div className="text-sm text-gray-400">Progress</div>
              </div>

              {/* Stars */}
              <div className="flex items-center space-x-1">
                {[...Array(topic.maxStars)].map((_, index) => (
                  <img
                    key={index}
                    src={
                      index < topic.stars
                        ? '/stars/star_full.png'
                        : '/stars/star_empty.png'
                    }
                    alt="Star"
                    className="h-6 w-6"
                  />
                ))}
              </div>
            </div>

            {/* Play Button */}
            <button className="btn-gradient px-8 py-3 rounded-lg font-bold text-lg hover:scale-105 transition-all duration-200">
              PLAY
            </button>
          </div>

          {/* Topic Image */}
          <div className="flex justify-center mb-4">
            <img
              src={topic.image}
              alt={topic.title}
              className="h-32 w-48 object-cover rounded-lg border-2 border-[#FCC822]"
            />
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
              View All
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
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-[#FCC822] hover:text-[#FFCD2E] transition-colors font-medium"
          >
            <img src="/buttons/Left.png" alt="Back" className="h-5 w-5" />
            <span>Zurück</span>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
