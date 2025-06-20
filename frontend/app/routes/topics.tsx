import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import {
  TopicsHeader,
  TopicsStatistics,
  TopicsFilters,
  TopicsGrid,
} from '../components';
import { useTopicsPage } from '../hooks/useTopicsPage';
import { fetchTopics } from '../api';
import type { Topic } from '../types/topics';

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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    filters,
    showFilters,
    statistics,
    sortedTopics,
    toggleFavorite,
    updateFilters,
    toggleFilters,
  } = useTopicsPage({ topics });

  // Load topics data
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const topicsData = await fetchTopics();
        setTopics(topicsData);
      } catch {
        // Error intentionally ignored
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
            <p className="text-gray-300">Loading topics...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
