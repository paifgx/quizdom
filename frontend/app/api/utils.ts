/**
 * API utility functions and constants for the Quizdom application.
 * Provides validation, error handling, and helper functions for the API layer.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default API delay in milliseconds.
 */
export const DEFAULT_API_DELAY = 300;

/**
 * Default cache TTL in milliseconds (5 minutes).
 */
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Extended cache TTL for initial data (10 minutes).
 */
export const EXTENDED_CACHE_TTL = 10 * 60 * 1000;

/**
 * Maximum retry attempts for failed API calls.
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Retry delay multiplier for exponential backoff.
 */
export const RETRY_DELAY_MULTIPLIER = 1.5;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates if a string is a valid topic ID.
 * Topic IDs must be lowercase, contain only letters and hyphens, and be non-empty.
 */
export const isValidTopicId = (id: string): boolean => {
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    /^[a-z-]+$/.test(id) &&
    id.length <= 50
  ); // Reasonable length limit
};

/**
 * Validates if a number is a valid star rating.
 * Star ratings must be integers between 1 and 5.
 */
export const isValidStarRating = (stars: number): boolean => {
  return Number.isInteger(stars) && stars >= 1 && stars <= 5;
};

/**
 * Validates if a string is a valid game mode ID.
 */
export const isValidGameModeId = (id: string): boolean => {
  return typeof id === 'string' && ['solo', 'duel', 'team'].includes(id);
};

/**
 * Validates if a string is a valid achievement ID.
 */
export const isValidAchievementId = (id: string): boolean => {
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    /^[a-z-]+$/.test(id) &&
    id.length <= 30
  );
};

/**
 * Validates if a number is a valid wisecoin amount.
 */
export const isValidWisecoinAmount = (amount: number): boolean => {
  return Number.isInteger(amount) && amount >= 0 && amount <= 10000;
};

/**
 * Validates if a number is a valid popularity score.
 */
export const isValidPopularityScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 100;
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom API error class for better error handling.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Creates a standardized API error for validation failures.
 */
export const createValidationError = (
  field: string,
  value: unknown,
  expectedType: string
): ApiError => {
  return new ApiError(
    `Ungültiger Wert für ${field}: ${value}. Erwarteter Typ: ${expectedType}`,
    400,
    'VALIDATION_ERROR',
    { field, value, expectedType }
  );
};

/**
 * Creates a standardized API error for not found resources.
 */
export const createNotFoundError = (
  resourceType: string,
  id: string
): ApiError => {
  return new ApiError(
    `${resourceType} mit ID "${id}" nicht gefunden.`,
    404,
    'NOT_FOUND',
    { resourceType, id }
  );
};

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Cache storage for API responses to improve performance.
 */
const cache = new Map<
  string,
  {
    data: unknown;
    timestamp: number;
    ttl: number;
    accessCount: number;
  }
>();

/**
 * Cache management utilities with enhanced features.
 */
export const cacheUtils = {
  /**
   * Gets cached data if it exists and is not expired.
   */
  get: <T>(key: string): T | null => {
    const cached = cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      cache.delete(key);
      return null;
    }

    // Update access count for LRU-like behavior
    cached.accessCount++;
    return cached.data as T;
  },

  /**
   * Sets data in cache with TTL.
   */
  set: <T>(key: string, data: T, ttl: number = DEFAULT_CACHE_TTL): void => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
    });
  },

  /**
   * Clears all cached data.
   */
  clear: (): void => {
    cache.clear();
  },

  /**
   * Invalidates cache entries matching a pattern.
   */
  invalidate: (pattern: string): void => {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  },

  /**
   * Gets cache statistics for debugging.
   */
  getStats: (): {
    size: number;
    keys: string[];
    totalAccessCount: number;
    averageAccessCount: number;
  } => {
    const keys = Array.from(cache.keys());
    const totalAccessCount = Array.from(cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );

    return {
      size: cache.size,
      keys,
      totalAccessCount,
      averageAccessCount: cache.size > 0 ? totalAccessCount / cache.size : 0,
    };
  },

  /**
   * Removes least recently used entries to maintain cache size.
   */
  cleanup: (maxSize: number = 100): void => {
    if (cache.size <= maxSize) return;

    const entries = Array.from(cache.entries()).sort(
      ([, a], [, b]) => a.accessCount - b.accessCount
    );

    const toRemove = entries.slice(0, cache.size - maxSize);
    toRemove.forEach(([key]) => cache.delete(key));
  },
};

// ============================================================================
// RETRY UTILITIES
// ============================================================================

/**
 * Retry configuration for API calls.
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration.
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: MAX_RETRY_ATTEMPTS,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: RETRY_DELAY_MULTIPLIER,
};

/**
 * Executes a function with retry logic.
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === finalConfig.maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay *
          Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simulates network delay for API calls.
 */
export const simulateDelay = (ms: number = DEFAULT_API_DELAY): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a cache key from multiple parts.
 */
export const generateCacheKey = (...parts: (string | number)[]): string => {
  return parts.map(part => String(part)).join(':');
};

/**
 * Debounces a function to prevent excessive API calls.
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttles a function to limit execution frequency.
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};
