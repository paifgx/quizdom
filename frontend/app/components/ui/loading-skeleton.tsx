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

/**
 * Topic detail page skeleton component
 * Mimics the complete structure of the topic detail page during loading
 */
export function TopicDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Topic Header Skeleton */}
      <div className="mb-6 lg:mb-8">
        <div className="w-full px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gray-800/80 border border-gray-600 rounded-xl backdrop-blur-sm flex items-center justify-between">
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gray-700 rounded-lg"></div>
            <div className="w-7 h-7 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Main Topic Content Container Skeleton */}
      <div className="bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm mb-6 flex flex-col lg:flex-row relative">
        {/* Topic Image Skeleton */}
        <div className="flex-shrink-0">
          <div className="h-48 w-full lg:h-full lg:w-64 bg-gray-700 rounded-t-xl lg:rounded-l-xl lg:rounded-t-none border-b-2 lg:border-b-0 lg:border-r-2 border-[#FCC822]"></div>
        </div>

        {/* Topic Content Skeleton */}
        <div className="flex-grow p-4 lg:p-6 flex flex-col">
          {/* Description and Stats Skeleton */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
            <div className="flex-1 lg:pr-8">
              {/* Description lines */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="flex flex-col items-start lg:items-end space-y-2">
              {/* Stars */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="h-6 w-6 lg:h-8 lg:w-8 bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
              {/* Difficulty text */}
              <div className="h-4 bg-gray-700 rounded w-24"></div>
              {/* Questions count */}
              <div className="h-4 bg-gray-700 rounded w-20"></div>
              {/* Wisecoin reward */}
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>

          {/* Achievements and Play Button Skeleton */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end space-y-4 lg:space-y-0">
            {/* Achievements skeleton */}
            <div className="flex flex-col space-y-2">
              <div className="h-4 bg-gray-700 rounded w-16"></div>
              <div className="flex items-center space-x-2 lg:space-x-3 flex-wrap gap-2">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="h-6 w-6 lg:h-8 lg:w-8 bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
            </div>
            {/* Play button skeleton */}
            <div className="w-full lg:w-32">
              <div className="h-12 bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Questions Skeleton */}
      <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-600 backdrop-blur-sm mb-6">
        {/* Questions header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-700 rounded w-40"></div>
        </div>
        {/* Questions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
            >
              {/* Question title */}
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-gray-600 rounded w-32"></div>
                <div className="h-4 w-4 bg-gray-600 rounded"></div>
              </div>
              {/* Difficulty and completion indicators */}
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-600 rounded w-16"></div>
                <div className="h-4 w-4 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back Navigation Skeleton */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}
