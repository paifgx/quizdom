/**
 * Custom hook for topic detail page functionality.
 * Manages topic data, favorite status, and navigation logic.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { TopicDetailData } from '../types/topic-detail';
import { getTopicData } from '../data/topic-detail-data';

interface UseTopicDetailOptions {
  /** Topic ID from URL parameters */
  topicId?: string;
}

interface UseTopicDetailReturn {
  /** Current topic data */
  topic: TopicDetailData;
  /** Function to toggle favorite status */
  toggleFavorite: () => void;
  /** Function to handle back navigation */
  handleBack: () => void;
  /** Function to navigate to game modes */
  navigateToGameModes: () => void;
}

/**
 * Manages topic detail page state and interactions.
 * Handles topic data loading, favorite toggling, and navigation.
 *
 * @param options - Configuration options including topic ID
 * @returns Object containing topic data and action handlers
 */
export function useTopicDetail({
  topicId,
}: UseTopicDetailOptions): UseTopicDetailReturn {
  const navigate = useNavigate();

  // Initialize topic state with data from topicId or default
  const [topic, setTopic] = useState<TopicDetailData>(() => {
    if (!topicId) return getTopicData('it-project-management');
    return getTopicData(topicId);
  });

  /**
   * Toggles the favorite status of the current topic.
   * Updates local state to reflect the change immediately.
   */
  const toggleFavorite = useCallback(() => {
    setTopic(prevTopic => ({
      ...prevTopic,
      isFavorite: !prevTopic.isFavorite,
    }));
  }, []);

  /**
   * Handles back navigation to the previous page.
   * Uses browser history to go back one step.
   */
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * Navigates to game modes page with current topic context.
   * Passes topic ID as query parameter for game mode selection.
   */
  const navigateToGameModes = useCallback(() => {
    navigate(`/game-modes?topic=${topic.id}`);
  }, [navigate, topic.id]);

  return {
    topic,
    toggleFavorite,
    handleBack,
    navigateToGameModes,
  };
}
