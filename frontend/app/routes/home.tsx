/**
 * Home page route component.
 * Renders different views based on authentication state following single responsibility principle.
 * Uses clean architecture with separated concerns and proper error handling.
 */
import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { LandingPage } from '../components/landing-page';
import { TopicsGrid } from '../components/topics/topics-grid';
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
 * - Favorite topics display with search
 * - Error boundary ready
 */
export default function HomePage() {
  const {
    isAuthenticated,
    isViewingAsAdmin: _isViewingAsAdmin,
    loading,
    searchTerm,
    favoriteTopics,
    filteredFavoriteTopics,
    isTopicsLoading,
    handleSearchChange,
    toggleFavorite,
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

  // Show favorite topics for authenticated users
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Favorite Topics Section */}
      <div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {translate('topics.favoriteTopics') || 'Favoriten'}
          </h2>
          <p className="text-gray-400 text-sm">
            {translate('topics.favoriteTopicsDescription') ||
              'Deine markierten Themen'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 lg:mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder={
                translate('topics.searchTopics') || 'Themen suchen...'
              }
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/80 border border-gray-600 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent text-base sm:text-lg backdrop-blur-sm"
            />
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <TopicsGrid
          topics={filteredFavoriteTopics}
          onToggleFavorite={toggleFavorite}
          isLoading={isTopicsLoading}
          showEmptyState={false}
        />

        {/* Show search results empty state */}
        {!isTopicsLoading &&
          searchTerm &&
          filteredFavoriteTopics.length === 0 &&
          favoriteTopics.length > 0 && (
            <div className="text-center py-8 sm:py-12">
              <img
                src="/topics/general.png"
                alt="No search results"
                className="h-16 w-16 mx-auto mb-4 opacity-50"
              />
              <p className="text-gray-400 text-base sm:text-lg mb-2">
                Keine Favoriten für "{searchTerm}" gefunden
              </p>
              <p className="text-gray-500 text-sm">
                Versuche einen anderen Suchbegriff oder schaue dir alle deine
                Favoriten an
              </p>
            </div>
          )}

        {/* Show no favorites state */}
        {!isTopicsLoading && favoriteTopics.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <img
              src="/topics/general.png"
              alt="No favorites"
              className="h-16 w-16 mx-auto mb-4 opacity-50"
            />
            <p className="text-gray-400 text-base sm:text-lg mb-2">
              {translate('topics.noFavoriteTopics') || 'Noch keine Favoriten'}
            </p>
            <p className="text-gray-500 text-sm">
              {translate('topics.addFavoritesFromTopics') ||
                'Markiere Themen in der Themenübersicht als Favorit'}
            </p>
            <div className="mt-6">
              <a
                href="/topics"
                className="inline-flex items-center px-6 py-3 bg-[#FCC822] text-gray-900 rounded-lg hover:bg-[#FCC822]/90 transition-colors duration-200 font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Zur Themenübersicht
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
