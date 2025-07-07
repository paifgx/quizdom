import type { MouseEvent } from 'react';
import type { GameTopic } from '../../types/topics';
import { TopicsTopicCard } from './topic-card';
import { TopicsPageGridSkeleton } from '../ui/loading-skeleton';
import { translate } from '../../utils/translations';

interface TopicsGridProps {
  topics: GameTopic[];
  onToggleFavorite: (topicId: string, event: MouseEvent) => void;
  isLoading?: boolean;
  showEmptyState?: boolean;
}

/**
 * Topics grid component for displaying topic cards.
 * Renders topics in a responsive grid layout with proper spacing.
 * Handles empty state when no topics are available and loading state with skeletons.
 *
 * @param props - Component props
 * @param props.topics - Array of topics to display
 * @param props.onToggleFavorite - Callback for favorite toggle actions
 * @param props.isLoading - Whether topics are currently loading
 * @param props.showEmptyState - Whether to show empty state when no topics are available
 */
export function TopicsGrid({
  topics,
  onToggleFavorite,
  isLoading = false,
  showEmptyState = true,
}: TopicsGridProps) {
  if (isLoading) {
    return <TopicsPageGridSkeleton count={9} />;
  }

  if (topics.length === 0 && showEmptyState) {
    return <EmptyTopicsState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map(topic => (
        <TopicsTopicCard
          key={topic.id}
          topic={topic}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

/**
 * Empty state component when no topics match current filters.
 * Provides helpful guidance to users about adjusting search criteria.
 */
function EmptyTopicsState() {
  return (
    <div className="text-center py-12">
      <img
        src="/topics/general.png"
        alt="No topics"
        className="h-16 w-16 mx-auto mb-4 opacity-50"
      />
      <p className="text-gray-400 text-lg">
        {translate('topics.noTopicsFound')}
      </p>
      <p className="text-gray-500 text-sm mt-2">
        {translate('topics.adjustSearchCriteria')}
      </p>
    </div>
  );
}
