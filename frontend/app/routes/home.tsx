/**
 * Home page route component.
 * Renders different views based on authentication state following single responsibility principle.
 * Uses clean architecture with separated concerns and proper error handling.
 */
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { Dashboard } from '../components/dashboard';
import { LandingPage } from '../components/landing-page';
import { useHomePage } from '../hooks/useHomePage';
import { translate } from '../utils/translations';

/**
 * Meta function for home page SEO and routing.
 * Provides page title and description for search engines.
 * Uses German content following language consistency rules.
 */
export const meta: MetaFunction = () => {
  return [
    { title: translate('pageTitles.home') },
    {
      name: 'description',
      content: translate('pageTitles.homeDescription'),
    },
  ];
};

export async function loader({ request: _request }: LoaderFunctionArgs) {
  // No special loading logic needed for home page
  return {};
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
    isViewingAsAdmin: _isViewingAsAdmin,
    loading,
    searchTerm,
    filteredTopics,
    handleSearchChange,
  } = useHomePage({ topics: [] }); // Empty topics for now until connected to real API

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-[#061421] flex items-center justify-center">
        <div className="text-[#FCC822] text-xl">Laden...</div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  // Landing page handles its own layout and styling
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Show dashboard for authenticated users
  // Wrap in container with proper spacing since we're not in dashboard layout
  return (
    <div className="container mx-auto px-4 py-8">
      <Dashboard
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        topics={[]}
        filteredTopics={filteredTopics}
        isTopicsLoading={loading}
      />
    </div>
  );
}
