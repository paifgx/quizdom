/**
 * Topic detail page component.
 * Displays comprehensive information about a specific quiz topic including
 * statistics, achievements, bookmarked questions, and navigation options.
 */

import { useParams } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import {
  TopicHeader,
  TopicStats,
  TopicAchievements,
  PlayButton,
  TopicQuestions,
  BackNavigation,
} from '../components/topic-detail';
import { useTopicDetail } from '../hooks/useTopicDetail';
import { sampleAchievements } from '../data/topic-detail-data';

export function meta() {
  return [
    { title: 'Topic Detail | Quizdom' },
    {
      name: 'description',
      content: 'Detailed view of quiz topic with questions and progress.',
    },
  ];
}

/**
 * Main topic detail page component.
 * Orchestrates the display of topic information, achievements, and questions.
 * Handles topic data loading, user interactions, and navigation.
 *
 * @returns JSX element for the complete topic detail page
 */
export default function TopicDetailPage() {
  const { topicId } = useParams();
  const { topic, toggleFavorite, handleBack, navigateToGameModes } =
    useTopicDetail({ topicId });

  // Early return for missing topic ID
  if (!topicId) {
    return (
      <ProtectedRoute>
        <div className="text-center text-white py-8">
          <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
          <p className="text-gray-300">
            The requested topic could not be found. Please try again.
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <TopicHeader topic={topic} onToggleFavorite={toggleFavorite} />

        {/* Main Topic Content Container */}
        <div className="bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm mb-6 flex flex-col lg:flex-row relative">
          {/* Topic Image */}
          <div className="flex-shrink-0">
            <img
              src={topic.image}
              alt={topic.title}
              className="h-48 w-full lg:h-full lg:w-64 object-cover rounded-t-xl lg:rounded-l-xl lg:rounded-t-none border-b-2 lg:border-b-0 lg:border-r-2 border-[#FCC822]"
            />
          </div>

          {/* Topic Content */}
          <div className="flex-grow p-4 lg:p-6 flex flex-col">
            {/* Description and Stats */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
              <div className="flex-1 lg:pr-8">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {topic.description}
                </p>
              </div>
              <TopicStats topic={topic} />
            </div>

            {/* Achievements and Play Button */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end space-y-4 lg:space-y-0">
              <TopicAchievements achievements={sampleAchievements} />
              <PlayButton onClick={navigateToGameModes} />
            </div>
          </div>
        </div>

        <TopicQuestions
          questions={topic.questions}
          bookmarkedCount={topic.bookmarkedQuestions}
          topicId={topic.id}
        />

        <BackNavigation onBack={handleBack} />
      </div>
    </ProtectedRoute>
  );
}
