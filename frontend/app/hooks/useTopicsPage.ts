import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/auth';
import type { Topic, TopicFilters } from '../types/topics';
import {
  filterTopics,
  sortTopics,
  calculateTopicStatistics,
} from '../utils/topics';

interface UseTopicsPageOptions {
  topics: Topic[];
}

interface UseTopicsPageReturn {
  // State
  topics: Topic[];
  filters: TopicFilters;
  showFilters: boolean;
  statistics: ReturnType<typeof calculateTopicStatistics>;

  // Computed values
  filteredTopics: Topic[];
  sortedTopics: Topic[];

  // Actions
  toggleFavorite: (topicId: string, event: React.MouseEvent) => void;
  updateFilters: (updates: Partial<TopicFilters>) => void;
  toggleFilters: () => void;
}

/**
 * Custom hook for managing topics page state and logic.
 * Handles filtering, sorting, favorites, and statistics calculations.
 * Provides clean separation between UI and business logic.
 *
 * @param options - Configuration options including available topics
 * @returns Object containing state, computed values, and action handlers
 */
export function useTopicsPage({
  topics,
}: UseTopicsPageOptions): UseTopicsPageReturn {
  const { user } = useAuth();

  // State management
  const [localTopics, setLocalTopics] = useState<Topic[]>(topics);
  const [filters, setFilters] = useState<TopicFilters>({
    category: 'all',
    difficulty: 'all',
    searchTerm: '',
    sortBy: 'popularity',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Computed values
  const filteredTopics = useMemo(
    () => filterTopics(localTopics, filters),
    [localTopics, filters]
  );

  const sortedTopics = useMemo(
    () => sortTopics(filteredTopics, filters.sortBy),
    [filteredTopics, filters.sortBy]
  );

  const statistics = useMemo(
    () => calculateTopicStatistics(localTopics, user?.wisecoins || 0),
    [localTopics, user?.wisecoins]
  );

  // Action handlers
  const toggleFavorite = useCallback(
    (topicId: string, event: React.MouseEvent) => {
      event.preventDefault(); // Prevent navigation when clicking favorite button

      setLocalTopics(prevTopics =>
        prevTopics.map(topic =>
          topic.id === topicId
            ? { ...topic, isFavorite: !topic.isFavorite }
            : topic
        )
      );
    },
    []
  );

  const updateFilters = useCallback((updates: Partial<TopicFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  return {
    // State
    topics: localTopics,
    filters,
    showFilters,
    statistics,

    // Computed values
    filteredTopics,
    sortedTopics,

    // Actions
    toggleFavorite,
    updateFilters,
    toggleFilters,
  };
}
