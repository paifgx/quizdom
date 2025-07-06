import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/auth';
import { topicsService } from '../services/api';
import type { GameTopic } from '../types/topics';

interface UseHomePageOptions {
  topics: GameTopic[]; // Keep for compatibility but not used
}

interface UseHomePageReturn {
  // Authentication state
  isAuthenticated: boolean;
  isViewingAsAdmin: boolean;
  loading: boolean;

  // Search state
  searchTerm: string;

  // Favorite topics
  favoriteTopics: GameTopic[];
  filteredFavoriteTopics: GameTopic[];
  isTopicsLoading: boolean;

  // Actions
  handleSearchChange: (value: string) => void;
  toggleFavorite: (topicId: string, event: React.MouseEvent) => void;
}

/**
 * Custom hook for managing home page state and logic.
 * Handles authentication checks, admin redirects, favorite topics, and search functionality.
 * Provides clean separation between UI and business logic.
 *
 * @param options - Configuration options including available topics
 * @returns Object containing authentication state, favorite topics, search state, and handlers
 */
export function useHomePage({
  topics: _topics,
}: UseHomePageOptions): UseHomePageReturn {
  const { isAuthenticated, isViewingAsAdmin, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteTopics, setFavoriteTopics] = useState<GameTopic[]>([]);
  const [isTopicsLoading, setIsTopicsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle admin redirect
  useEffect(() => {
    if (isAuthenticated && isViewingAsAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isViewingAsAdmin, navigate]);

  // Load favorite topics
  useEffect(() => {
    if (isAuthenticated) {
      const loadFavoriteTopics = async () => {
        try {
          setIsTopicsLoading(true);
          const allTopics = await topicsService.getAll();

          // Load favorite IDs from localStorage
          const favoriteIds = JSON.parse(
            localStorage.getItem('favoriteTopicIds') || '[]'
          );

          // Mark topics as favorite based on localStorage
          const topicsWithFavorites = allTopics.map(topic => {
            const completedKey = `completed_${topic.id}`;
            let completed: string[] = [];
            try {
              completed = JSON.parse(
                localStorage.getItem(completedKey) || '[]'
              );
            } catch {
              completed = [];
            }
            return {
              ...topic,
              isFavorite: favoriteIds.includes(topic.id),
              completedQuestions: completed.length,
            };
          });

          const favorites = topicsWithFavorites.filter(
            topic => topic.isFavorite
          );
          setFavoriteTopics(favorites);
        } catch (error) {
          console.error('Failed to load favorite topics:', error);
        } finally {
          setIsTopicsLoading(false);
        }
      };

      loadFavoriteTopics();
    }
  }, [isAuthenticated]);

  // Filter favorite topics based on search term
  const filteredFavoriteTopics = favoriteTopics.filter(
    topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Search handler
  const handleSearchChange = useCallback((value: string) => {
    if (typeof value !== 'string') {
      throw new Error('Search term must be a string');
    }
    setSearchTerm(value);
  }, []);

  // Toggle favorite handler
  const toggleFavorite = useCallback(
    (topicId: string, event: React.MouseEvent) => {
      event.preventDefault(); // Prevent navigation when clicking favorite button

      setFavoriteTopics(prevTopics => {
        const topic = prevTopics.find(t => t.id === topicId);
        const isCurrentlyFavorite = !!topic;

        if (isCurrentlyFavorite) {
          // Remove from favorites
          const updatedTopics = prevTopics.filter(t => t.id !== topicId);

          // Update localStorage
          const favoriteIds = JSON.parse(
            localStorage.getItem('favoriteTopicIds') || '[]'
          );
          const updatedFavoriteIds = favoriteIds.filter(
            (id: string) => id !== topicId
          );
          localStorage.setItem(
            'favoriteTopicIds',
            JSON.stringify(updatedFavoriteIds)
          );

          return updatedTopics;
        } else {
          // Add to favorites - we need to get the full topic data
          // For now, we'll need to reload all topics to get the full data
          // This is a limitation of the current implementation
          const favoriteIds = JSON.parse(
            localStorage.getItem('favoriteTopicIds') || '[]'
          );
          const updatedFavoriteIds = [...favoriteIds, topicId];
          localStorage.setItem(
            'favoriteTopicIds',
            JSON.stringify(updatedFavoriteIds)
          );

          // Reload to get the full topic data
          window.location.reload();
          return prevTopics;
        }
      });
    },
    []
  );

  return {
    // Authentication state
    isAuthenticated,
    isViewingAsAdmin,
    loading,

    // Search state
    searchTerm,

    // Favorite topics
    favoriteTopics,
    filteredFavoriteTopics,
    isTopicsLoading,

    // Actions
    handleSearchChange,
    toggleFavorite,
  };
}
