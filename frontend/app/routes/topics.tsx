import React, { useEffect } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import {
  TopicsHeader,
  TopicsStatistics,
  TopicsFilters,
  TopicsGrid,
} from '../components';
import { useTopicsPage } from '../hooks/useTopicsPage';
import { topics } from '../data/topics-data';

export function meta() {
  return [
    { title: 'Topics Overview | Quizdom' },
    {
      name: 'description',
      content: 'Overview of all available quiz topics.',
    },
  ];
}

/**
 * Topics page component.
 * Displays a comprehensive overview of available quiz topics with filtering,
 * sorting, and statistics. Provides navigation to individual topic details.
 *
 * Features:
 * - Topic filtering by category, difficulty, and search terms
 * - Sorting by popularity, difficulty, title, or progress
 * - Favorite topic management
 * - Progress tracking and statistics
 * - Responsive grid layout
 *
 * @returns Topics page JSX element
 */
export default function TopicsPage() {
  const {
    filters,
    showFilters,
    statistics,
    sortedTopics,
    toggleFavorite,
    updateFilters,
    toggleFilters,
  } = useTopicsPage({ topics });

  // Initialize topics data
  useEffect(() => {
    // In a real application, this would fetch from an API
    // For now, we use the static data from topics-data.ts
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TopicsHeader />
        <TopicsStatistics statistics={statistics} />

        <TopicsFilters
          filters={filters}
          showFilters={showFilters}
          onUpdateFilters={updateFilters}
          onToggleFilters={toggleFilters}
        />

        <TopicsGrid topics={sortedTopics} onToggleFavorite={toggleFavorite} />
      </div>
    </ProtectedRoute>
  );
}
