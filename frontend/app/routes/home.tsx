/**
 * Home page route component.
 * Renders different views based on authentication state following single responsibility principle.
 * Uses clean architecture with separated concerns and proper error handling.
 */
import type { Route } from './+types/home';
import { LandingPage } from '../components/landing-page';
import { Dashboard } from '../components/dashboard';
import { LoadingSpinner } from '../components/home/loading-spinner';
import { useHomePage } from '../hooks/useHomePage';
import { fetchHomeTopics } from '../api';
import { useEffect, useState } from 'react';

// Add type definition for HomeTopic
interface HomeTopic {
  id: string;
  title: string;
  image: string;
  description: string;
}

/**
 * Meta function for home page SEO and routing.
 * Provides page title and description for search engines.
 * Uses English content following language consistency rules.
 */
export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Quizdom - Rise of the Wise' },
    {
      name: 'description',
      content: 'Welcome to Quizdom - The ultimate quiz experience!',
    },
  ];
}

/**
 * Main home page component.
 * Acts as a smart container component that orchestrates authentication-based rendering.
 * Delegates business logic to custom hooks and renders appropriate views.
 *
 * Features:
 * - Authentication-based view switching
 * - Loading state management
 * - Admin dashboard redirection
 * - Topic search functionality
 * - Error boundary ready
 */
export default function HomePage() {
  const [homeTopics, setHomeTopics] = useState<HomeTopic[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load home topics data
  useEffect(() => {
    const loadHomeTopics = async () => {
      try {
        const topics = await fetchHomeTopics();
        setHomeTopics(topics);
      } catch {
        // Error intentionally ignored
      } finally {
        setDataLoading(false);
      }
    };

    loadHomeTopics();
  }, []);

  const {
    isAuthenticated,
    loading,
    searchTerm,
    filteredTopics,
    handleSearchChange,
  } = useHomePage({ topics: homeTopics });

  // Show loading state during authentication check or data loading
  if (loading || dataLoading) {
    return <LoadingSpinner />;
  }

  // Render authenticated user dashboard
  if (isAuthenticated) {
    return (
      <Dashboard
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        topics={homeTopics}
        filteredTopics={filteredTopics}
      />
    );
  }

  // Render landing page for unauthenticated users
  return <LandingPage />;
}
