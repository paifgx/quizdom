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
