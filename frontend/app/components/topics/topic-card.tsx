import type { MouseEvent } from 'react';
import { Link } from 'react-router';
import type { Topic } from '../../types/topics';
import {
  getDifficultyColor,
  getDifficultyName,
  getProgressPercentage,
} from '../../utils/topics';
import { translate } from '../../utils/translations';

interface TopicsTopicCardProps {
  topic: Topic;
  onToggleFavorite: (topicId: string, event: MouseEvent) => void;
}

/**
 * Topic card component for displaying individual topics.
 * Shows topic information, progress, difficulty, and interactive elements.
 * Handles favorite toggling and navigation to topic details.
 *
 * @param props - Component props
 * @param props.topic - Topic data to display
 * @param props.onToggleFavorite - Callback for favorite toggle action
 */
export function TopicsTopicCard({
  topic,
  onToggleFavorite,
}: TopicsTopicCardProps) {
  const progressPercentage = getProgressPercentage(
    topic.completedQuestions,
    topic.totalQuestions
  );

  return (
    <Link
      to={`/topics/${topic.id}`}
      className={`bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 block ${
        topic.isCompleted
          ? 'border-green-500 shadow-lg shadow-green-500/20'
          : topic.isFavorite
            ? 'border-red-500 shadow-lg shadow-red-500/20 hover:border-red-400'
            : 'border-gray-700 hover:border-[#FCC822]'
      }`}
    >
      <TopicBanner topic={topic} onToggleFavorite={onToggleFavorite} />
      <TopicContent topic={topic} progressPercentage={progressPercentage} />
    </Link>
  );
}

interface TopicBannerProps {
  topic: Topic;
  onToggleFavorite: (topicId: string, event: MouseEvent) => void;
}

/**
 * Banner section of topic card with image, difficulty badge, and favorite button.
 * Handles visual indicators for topic status and user interactions.
 */
function TopicBanner({ topic, onToggleFavorite }: TopicBannerProps) {
  return (
    <div className="relative h-32 w-full">
      <img
        src={topic.image}
        alt={topic.title}
        className="h-full w-full object-cover"
        onError={e => {
          e.currentTarget.src = '/badges/badge_book_1.png';
        }}
      />

      <DifficultyBadge stars={topic.stars} />
      <FavoriteButton
        topicId={topic.id}
        isFavorite={topic.isFavorite}
        onToggle={onToggleFavorite}
      />
      {topic.isCompleted && <CompletionBadge />}
    </div>
  );
}

interface DifficultyBadgeProps {
  stars: number;
}

/**
 * Difficulty badge component showing topic difficulty level.
 */
function DifficultyBadge({ stars }: DifficultyBadgeProps) {
  return (
    <div className="absolute top-3 left-3">
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(stars)}`}
      >
        {getDifficultyName(stars)}
      </span>
    </div>
  );
}

interface FavoriteButtonProps {
  topicId: string;
  isFavorite: boolean;
  onToggle: (topicId: string, event: MouseEvent) => void;
}

/**
 * Favorite toggle button component.
 * Allows users to add/remove topics from favorites.
 */
function FavoriteButton({
  topicId,
  isFavorite,
  onToggle,
}: FavoriteButtonProps) {
  return (
    <button
      onClick={event => onToggle(topicId, event)}
      className="absolute top-3 right-3 p-2 bg-gray-900 bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200"
      title={
        isFavorite
          ? translate('topics.removeFromFavorites')
          : translate('topics.addToFavorites')
      }
    >
      <svg
        className={`h-4 w-4 transition-colors duration-200 ${
          isFavorite
            ? 'text-red-500 fill-current'
            : 'text-gray-400 hover:text-red-500'
        }`}
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

/**
 * Completion badge component for completed topics.
 */
function CompletionBadge() {
  return (
    <div className="absolute bottom-3 right-3 flex items-center space-x-2 bg-gray-900 bg-opacity-80 rounded-full px-2 py-1">
      <img
        src="/buttons/Accept.png"
        alt={translate('topics.completed')}
        className="h-4 w-4"
      />
      <span className="text-green-400 text-xs font-medium">
        {translate('topics.completed')}
      </span>
    </div>
  );
}

interface TopicContentProps {
  topic: Topic;
  progressPercentage: number;
}

/**
 * Content section of topic card with details and progress information.
 * Displays topic metadata, progress bar, and statistics.
 */
function TopicContent({ topic, progressPercentage }: TopicContentProps) {
  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-white mb-2">{topic.title}</h3>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {topic.description}
      </p>

      <ProgressBar
        completed={topic.completedQuestions}
        total={topic.totalQuestions}
        percentage={progressPercentage}
      />

      <TopicMetadata topic={topic} />

      <div className="flex justify-end pt-4 border-t border-gray-700">
        <div className="text-[#FCC822] text-sm font-medium">
          {translate('topics.exploreTopic')} →
        </div>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
}

/**
 * Progress bar component showing topic completion status.
 */
function ProgressBar({
  completed: _completed,
  total: _total,
  percentage,
}: ProgressBarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>{translate('topics.progress')}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-[#FCC822] h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface TopicMetadataProps {
  topic: Topic;
}

/**
 * Topic metadata display component.
 * Shows category, question count, difficulty stars, and wisecoin reward.
 */
function TopicMetadata({ topic }: TopicMetadataProps) {
  return (
    <div className="space-y-2 text-sm text-gray-400 mb-4">
      <div className="flex justify-between">
        <span>{translate('topics.category')}:</span>
        <span className="text-[#FCC822]">{topic.category}</span>
      </div>
      <div className="flex justify-between">
        <span>{translate('topics.questions')}:</span>
        <span>
          {topic.completedQuestions}/{topic.totalQuestions}
        </span>
      </div>
      <div className="flex justify-between">
        <span>{translate('topics.difficulty')}:</span>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => (
            <img
              key={index}
              src={
                index < topic.stars
                  ? '/stars/star_full.png'
                  : '/stars/star_empty.png'
              }
              alt={`${translate('topics.star')} ${index + 1}`}
              className="h-3 w-3"
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <span>{translate('topics.reward')}:</span>
        <div className="flex items-center space-x-1">
          <img
            src="/wisecoin/wisecoin.png"
            alt={translate('topics.wisecoins')}
            className="h-4 w-4"
          />
          <span className="text-[#FCC822]">{topic.wisecoinReward}</span>
        </div>
      </div>
    </div>
  );
}
