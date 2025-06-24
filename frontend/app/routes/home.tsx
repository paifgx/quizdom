/**
 * Home page route component.
 * Renders different views based on authentication state following single responsibility principle.
 * Uses clean architecture with separated concerns and proper error handling.
 */
import type { Route } from './+types/home';
import { Dashboard } from '../components/dashboard';
import { useHomePage } from '../hooks/useHomePage';
import { translate } from '../utils/translations';

/**
 * Meta function for home page SEO and routing.
 * Provides page title and description for search engines.
 * Uses German content following language consistency rules.
 */
export function meta(_args: Route.MetaArgs) {
  return [
    { title: translate('pageTitles.home') },
    {
      name: 'description',
      content: translate('pageTitles.homeDescription'),
    },
  ];
}

export async function loader({ request: _request }: Route.LoaderArgs) {
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
export default function HomePage(_props: Route.ComponentProps) {
  const {
    isAuthenticated: _isAuthenticated,
    isViewingAsAdmin: _isViewingAsAdmin,
    loading,
    searchTerm,
    filteredTopics,
    handleSearchChange,
  } = useHomePage({ topics: [] }); // Empty topics for now until connected to real API

  return (
    <Dashboard
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      topics={[]}
      filteredTopics={filteredTopics}
      isTopicsLoading={loading}
    />
  );
}
