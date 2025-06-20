/**
 * Reusable loading skeleton component
 * Provides visual feedback during data loading states
 */
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Laden">
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      <div className="space-y-3">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
      <span className="sr-only">Inhalt wird geladen...</span>
    </div>
  );
}

/**
 * Topic card skeleton component for loading states
 * Mimics the appearance of actual topic cards during data loading
 */
export function TopicCardSkeleton() {
  return (
    <div className="bg-gray-800/70 rounded-xl overflow-hidden border border-gray-600 backdrop-blur-sm animate-pulse">
      <div className="w-full h-40 sm:h-48 bg-gray-700 rounded-xl"></div>
    </div>
  );
}

/**
 * Grid of topic card skeletons
 * Shows multiple skeleton cards while topics are loading
 */
export function TopicsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }, (_, index) => (
        <TopicCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Advanced topic card skeleton component for the topics page
 * Mimics the full structure of TopicsTopicCard including banner, content, and progress
 */
export function TopicsTopicCardSkeleton() {
  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
      {/* Banner skeleton */}
      <div className="relative h-32 w-full bg-gray-700">
        {/* Difficulty badge skeleton */}
        <div className="absolute top-3 left-3">
          <div className="w-16 h-6 bg-gray-600 rounded-full"></div>
        </div>
        {/* Favorite button skeleton */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>

        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>

        {/* Progress bar skeleton */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="h-3 bg-gray-700 rounded w-16"></div>
            <div className="h-3 bg-gray-700 rounded w-12"></div>
          </div>
          <div className="h-2 bg-gray-700 rounded w-full"></div>
        </div>

        {/* Metadata skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-12"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-16"></div>
          </div>
        </div>

        {/* Action text skeleton */}
        <div className="flex justify-end pt-4 border-t border-gray-700">
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of detailed topic card skeletons for the topics page
 * Shows multiple skeleton cards with full topic card structure
 */
export function TopicsPageGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <TopicsTopicCardSkeleton key={index} />
      ))}
    </div>
  );
}
