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
import type { GameTopic } from '../types/topics';

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
  const [topics, setTopics] = useState<GameTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
        const topicsData = await fetchTopics();
        setTopics(topicsData);
      } catch {
        setError('Fehler beim Laden der Themen');
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-gradient px-4 py-2 rounded-lg"
            >
              Neu laden
            </button>
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

        <TopicsGrid
          topics={sortedTopics}
          onToggleFavorite={toggleFavorite}
          isLoading={loading}
        />

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && !loading && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm text-gray-300">
            <p>Debug Info:</p>
            <p>Total topics loaded: {topics.length}</p>
            <p>Sorted topics count: {sortedTopics.length}</p>
            <p>Filters: {JSON.stringify(filters, null, 2)}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
