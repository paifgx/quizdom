import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/auth';

// Update the import to use the new API data structure
interface HomeTopic {
  id: string;
  title: string;
  image: string;
  description: string;
}

interface UseHomePageOptions {
  topics: HomeTopic[];
}

interface UseHomePageReturn {
  // Authentication state
  isAuthenticated: boolean;
  isViewingAsAdmin: boolean;
  loading: boolean;

  // Search state
  searchTerm: string;
  filteredTopics: HomeTopic[];

  // Actions
  handleSearchChange: (value: string) => void;
}

/**
 * Custom hook for managing home page state and logic.
 * Handles authentication checks, admin redirects, and topic filtering.
 * Provides clean separation between UI and business logic.
 *
 * @param options - Configuration options including available topics
 * @returns Object containing authentication state, search state, and handlers
 */
export function useHomePage({ topics }: UseHomePageOptions): UseHomePageReturn {
  const { isAuthenticated, isViewingAsAdmin, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Handle admin redirect
  useEffect(() => {
    if (isAuthenticated && isViewingAsAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isViewingAsAdmin, navigate]);

  // Filter topics based on search term
  const filteredTopics = topics.filter(
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

  return {
    // Authentication state
    isAuthenticated,
    isViewingAsAdmin,
    loading,

    // Search state
    searchTerm,
    filteredTopics,

    // Actions
    handleSearchChange,
  };
}
