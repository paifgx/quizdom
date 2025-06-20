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
import { homeTopics } from '../data/home-topics';

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
  const {
    isAuthenticated,
    loading,
    searchTerm,
    filteredTopics,
    handleSearchChange,
  } = useHomePage({ topics: homeTopics });

  // Show loading state during authentication check
  if (loading) {
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
