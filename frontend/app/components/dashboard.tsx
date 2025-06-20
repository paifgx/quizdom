import { Link } from 'react-router';
import { translate } from '../utils/translations';
import { TopicsGridSkeleton } from './ui/loading-skeleton';

interface Topic {
  id: string;
  title: string;
  image: string;
  description: string;
}

interface DashboardProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  topics: Topic[];
  filteredTopics: Topic[];
  isTopicsLoading?: boolean;
}

/**
 * Presentational dashboard component for authenticated users.
 * Displays topics and search functionality with German language interface.
 * Follows accessibility best practices and responsive design.
 */
export function Dashboard({
  searchTerm,
  onSearchChange,
  topics: _topics,
  filteredTopics,
  isTopicsLoading = false,
}: DashboardProps) {
  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6 lg:mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder={translate('topics.searchTopics')}
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
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

      {/* Topics Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {translate('topics.yourTopics')}
        </h2>
      </div>

      {/* Topics Grid or Skeleton */}
      {isTopicsLoading ? (
        <TopicsGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredTopics.map(topic => (
            <Link
              key={topic.id}
              to={`/topics/${topic.id}`}
              className="group relative bg-gray-800/70 rounded-xl overflow-hidden border border-gray-600 hover:border-[#FCC822] transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              title={topic.description}
            >
              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="w-full h-40 sm:h-48 object-cover rounded-xl"
                />
              </div>

              {/* Hover tooltip */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-center p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm font-medium">
                    {topic.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No results message */}
      {!isTopicsLoading && filteredTopics.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-400 text-base sm:text-lg mb-2">
            {translate('topics.noTopicsFound')}
          </p>
          <p className="text-gray-500 text-sm">
            {translate('topics.tryDifferentSearch')}
          </p>
        </div>
      )}
    </div>
  );
}
