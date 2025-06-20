import React from 'react';
import type { Topic } from '../../types/topics';
import { TopicsTopicCard } from './topic-card';

interface TopicsGridProps {
  topics: Topic[];
  onToggleFavorite: (topicId: string, event: React.MouseEvent) => void;
}

/**
 * Topics grid component for displaying topic cards.
 * Renders topics in a responsive grid layout with proper spacing.
 * Handles empty state when no topics are available.
 *
 * @param props - Component props
 * @param props.topics - Array of topics to display
 * @param props.onToggleFavorite - Callback for favorite toggle actions
 */
export function TopicsGrid({ topics, onToggleFavorite }: TopicsGridProps) {
  if (topics.length === 0) {
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
        src="/badges/badge_book_1.png"
        alt="No topics"
        className="h-16 w-16 mx-auto mb-4 opacity-50"
      />
      <p className="text-gray-400 text-lg">No topics found.</p>
      <p className="text-gray-500 text-sm mt-2">
        Try adjusting your search criteria or selecting a different category.
      </p>
    </div>
  );
}
