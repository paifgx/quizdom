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
import { TopicDetailSkeleton } from '../components/ui/loading-skeleton';
import { useTopicDetail } from '../hooks/useTopicDetail';
import { fetchAchievements } from '../api';
import { useState, useEffect } from 'react';
import type { Achievement } from '../types/topic-detail';
import { ProgressBar } from '../components/topics/topic-card';
import { getProgressPercentage } from '../utils/topics';

export function meta() {
  return [
    { title: 'Thema Details | Quizdom' },
    {
      name: 'description',
      content: 'Detailansicht des Quiz-Themas mit Fragen und Fortschritt.',
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
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const {
    topic,
    isLoading,
    error,
    toggleFavorite,
    handleBack,
    navigateToGameModes,
  } = useTopicDetail({ topicId });

  // Load achievements data
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const achievementsData = await fetchAchievements();
        setAchievements(achievementsData);
      } catch {
        // Error intentionally ignored
      }
    };

    loadAchievements();
  }, []);

  // Early return for missing topic ID
  if (!topicId) {
    return (
      <ProtectedRoute>
        <div className="text-center text-white py-8">
          <h1 className="text-2xl font-bold mb-4">Thema nicht gefunden</h1>
          <p className="text-gray-300">
            Das angeforderte Thema konnte nicht gefunden werden. Bitte versuchen
            Sie es erneut.
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <TopicDetailSkeleton />
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="text-center text-white py-8">
          <h1 className="text-2xl font-bold mb-4">
            Fehler beim Laden des Themas
          </h1>
          <p className="text-gray-300">
            Das Thema konnte nicht geladen werden. Bitte versuchen Sie es später
            erneut.
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!topic) {
    return (
      <ProtectedRoute>
        <div className="text-center text-white py-8">
          <h1 className="text-2xl font-bold mb-4">Thema nicht gefunden</h1>
          <p className="text-gray-300">
            Das angeforderte Thema konnte nicht gefunden werden.
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  const progressPercentage = getProgressPercentage(
    topic.completedQuestions,
    topic.totalQuestions
  );

  return (
    <ProtectedRoute>
      <div>
        <TopicHeader topic={topic} onToggleFavorite={toggleFavorite} />

        {/* ProgressBar Bereich */}
        <div className="w-full flex justify-center mb-8">
          <div className="bg-gray-800/80 border border-gray-600 rounded-xl p-4 flex flex-col items-center w-full max-w-4xl">
            <ProgressBar
              completed={topic.completedQuestions}
              total={topic.totalQuestions}
              percentage={progressPercentage}
              className="h-8 text-base w-full"
            />
            <div className="text-gray-300 text-sm mt-1">
              {topic.completedQuestions} von {topic.totalQuestions} Fragen
              abgeschlossen
            </div>
          </div>
        </div>

        {/* Main Topic Content Container */}
        <div className="bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm mb-6 flex flex-col lg:flex-row relative">
          {/* Topic Image */}
          <div className="flex-shrink-0">
            <img
              src={'/topics/general.png'}
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
              <TopicAchievements achievements={achievements} />
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
