import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import {
  TopicsHeader,
  TopicsStatistics,
  TopicsFilters,
  TopicsGrid,
} from '../components';
import { useTopicsPage } from '../hooks/useTopicsPage';
import { topicsService } from '../services/api';
import type { GameTopic } from '../types/topics';

/**
 * Route metadata for the topics page.
 *
 * Provides SEO metadata and page title for topic browsing.
 * Enhances discoverability and user navigation experience.
 */
export function meta() {
  return [
    { title: 'Themen | Quizdom' },
    { name: 'description', content: 'Themenübersicht' },
  ];
}

/**
 * Topics page component.
 *
 * Displays comprehensive overview of available quiz topics with filtering.
 * Provides navigation to individual topic details and progress tracking.
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
        const topicsData = await topicsService.getAll();
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
      </div>
    </ProtectedRoute>
  );
}
