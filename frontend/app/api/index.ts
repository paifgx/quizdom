/**
 * API simulation layer for Quizdom application.
 * Provides async functions that simulate external API calls with realistic delays.
 * Serves as the main interface for data fetching throughout the application.
 * Includes error handling, caching, and validation for improved reliability.
 */

import type { GameMode, Topic as GameTopic } from '../types/game';
import type { Topic, DifficultyLevel } from '../types/topics';
import type { TopicDetailData, Achievement } from '../types/topic-detail';
import {
  categories,
  difficultyNames,
  difficultyNameMap,
  gameModes,
  getGameTopics,
  getHomeTopics,
  getTopics,
  getTopicDetailData,
  sampleAchievements,
  updateMasterTopic,
  findMasterTopic,
} from './data';
import {
  ApiError,
  cacheUtils,
  createValidationError,
  createNotFoundError,
  isValidTopicId,
  isValidStarRating,
  isValidGameModeId,
  isValidAchievementId,
  simulateDelay,
  generateCacheKey,
  withRetry,
  EXTENDED_CACHE_TTL,
} from './utils';

// ============================================================================
// REFERENCE DATA API
// ============================================================================

/**
 * Fetches available topic categories.
 * @returns Promise resolving to array of category names
 */
export async function fetchCategories(): Promise<string[]> {
  const cacheKey = 'categories';
  const cached = cacheUtils.get<string[]>(cacheKey);
  if (cached) return cached;

  await simulateDelay();
  const result = [...categories];
  cacheUtils.set(cacheKey, result);
  return result;
}

/**
 * Fetches difficulty level names.
 * @returns Promise resolving to array of difficulty names
 */
export async function fetchDifficultyNames(): Promise<DifficultyLevel[]> {
  const cacheKey = 'difficulty-names';
  const cached = cacheUtils.get<DifficultyLevel[]>(cacheKey);
  if (cached) return cached;

  await simulateDelay();
  const result = [...difficultyNames];
  cacheUtils.set(cacheKey, result);
  return result;
}

/**
 * Gets difficulty name for a given star rating.
 * @param stars - Star rating (1-5)
 * @returns Difficulty name
 * @throws ApiError if stars parameter is invalid
 */
export function getDifficultyName(stars: number): string {
  if (!isValidStarRating(stars)) {
    throw createValidationError('stars', stars, 'integer between 1 and 5');
  }

  return difficultyNameMap[stars] || difficultyNameMap[1];
}

// ============================================================================
// GAME MODES API
// ============================================================================

/**
 * Fetches available game modes.
 * @returns Promise resolving to array of game modes
 */
export async function fetchGameModes(): Promise<GameMode[]> {
  const cacheKey = 'game-modes';
  const cached = cacheUtils.get<GameMode[]>(cacheKey);
  if (cached) return cached;

  await simulateDelay();
  const result = [...gameModes];
  cacheUtils.set(cacheKey, result);
  return result;
}

/**
 * Fetches game mode by ID.
 * @param modeId - Game mode identifier
 * @returns Promise resolving to game mode or null if not found
 * @throws ApiError if modeId is invalid
 */
export async function fetchGameModeById(
  modeId: string
): Promise<GameMode | null> {
  if (!isValidGameModeId(modeId)) {
    throw createValidationError(
      'modeId',
      modeId,
      'valid game mode ID (solo, duel, team)'
    );
  }

  const cacheKey = generateCacheKey('game-mode', modeId);
  const cached = cacheUtils.get<GameMode | null>(cacheKey);
  if (cached !== null) return cached;

  await simulateDelay();
  const result = gameModes.find(mode => mode.id === modeId) || null;
  cacheUtils.set(cacheKey, result);
  return result;
}

// ============================================================================
// TOPICS API
// ============================================================================

/**
 * Fetches topics for game mode selection.
 * @returns Promise resolving to array of game topics
 */
export async function fetchGameTopics(): Promise<GameTopic[]> {
  const cacheKey = 'game-topics';
  const cached = cacheUtils.get<GameTopic[]>(cacheKey);
  if (cached) return cached;

  await simulateDelay();
  const result = getGameTopics();
  cacheUtils.set(cacheKey, result);
  return result;
}

/**
 * Fetches simplified topics for home page dashboard.
 * @returns Promise resolving to array of home topics
 */
export async function fetchHomeTopics(): Promise<
  ReturnType<typeof getHomeTopics>
> {
  const cacheKey = 'home-topics';
  const cached = cacheUtils.get<ReturnType<typeof getHomeTopics>>(cacheKey);
  if (cached) return cached;

  await simulateDelay();
  const result = getHomeTopics();
  cacheUtils.set(cacheKey, result);
  return result;
}

/**
 * Fetches complete topics data for topics page.
 * @returns Promise resolving to array of topics with full metadata
 */
export async function fetchTopics(): Promise<Topic[]> {
  const cacheKey = 'topics';
  const cached = cacheUtils.get<Topic[]>(cacheKey);
  if (cached) return cached;

  await simulateDelay();
  const result = getTopics();
  cacheUtils.set(cacheKey, result);
  return result;
}

/**
 * Fetches topic by ID from the topics collection.
 * @param topicId - Topic identifier
 * @returns Promise resolving to topic or null if not found
 * @throws ApiError if topicId is invalid
 */
export async function fetchTopicById(topicId: string): Promise<Topic | null> {
  if (!isValidTopicId(topicId)) {
    throw createValidationError('topicId', topicId, 'valid topic ID');
  }

  const cacheKey = generateCacheKey('topic', topicId);
  const cached = cacheUtils.get<Topic | null>(cacheKey);
  if (cached !== null) return cached;

  await simulateDelay();
  const topics = getTopics();
  const result = topics.find(topic => topic.id === topicId) || null;
  cacheUtils.set(cacheKey, result);
  return result;
}

/**
 * Updates topic favorite status.
 * @param topicId - Topic identifier
 * @param isFavorite - New favorite status
 * @returns Promise resolving to updated topic or null if not found
 * @throws ApiError if parameters are invalid
 */
export async function updateTopicFavorite(
  topicId: string,
  isFavorite: boolean
): Promise<Topic | null> {
  if (!isValidTopicId(topicId)) {
    throw createValidationError('topicId', topicId, 'valid topic ID');
  }

  if (typeof isFavorite !== 'boolean') {
    throw createValidationError('isFavorite', isFavorite, 'boolean');
  }

  await simulateDelay();

  // Update the master data source
  const updatedMasterTopic = updateMasterTopic(topicId, { isFavorite });
  if (!updatedMasterTopic) {
    throw createNotFoundError('Topic', topicId);
  }

  // Invalidate related caches
  cacheUtils.invalidate('topics');
  cacheUtils.invalidate(`topic-${topicId}`);

  // Return the updated topic in the Topic interface format
  return {
    id: updatedMasterTopic.id,
    title: updatedMasterTopic.title,
    description: updatedMasterTopic.description,
    category: updatedMasterTopic.category,
    totalQuestions: updatedMasterTopic.totalQuestions,
    completedQuestions: updatedMasterTopic.completedQuestions,
    image: updatedMasterTopic.image,
    stars: updatedMasterTopic.stars,
    popularity: updatedMasterTopic.popularity,
    wisecoinReward: updatedMasterTopic.wisecoinReward,
    isCompleted: updatedMasterTopic.isCompleted,
    isFavorite: updatedMasterTopic.isFavorite,
  };
}

// ============================================================================
// TOPIC DETAIL API
// ============================================================================

/**
 * Fetches detailed topic data by ID.
 * @param topicId - Topic identifier
 * @returns Promise resolving to topic detail data
 * @throws ApiError if topicId is invalid
 */
export async function fetchTopicDetailData(
  topicId: string
): Promise<TopicDetailData> {
  if (!isValidTopicId(topicId)) {
    throw createValidationError('topicId', topicId, 'valid topic ID');
  }

  const cacheKey = generateCacheKey('topic-detail', topicId);
  const cached = cacheUtils.get<TopicDetailData>(cacheKey);
  if (cached) return cached;

  await simulateDelay();

  // Return specific topic data or default to IT Project Management
  const topicDetailData = getTopicDetailData();
  const result =
    topicDetailData[topicId] || topicDetailData['it-project-management'];
  cacheUtils.set(cacheKey, result);

  return result;
}

/**
 * Updates topic detail favorite status.
 * @param topicId - Topic identifier
 * @param isFavorite - New favorite status
 * @returns Promise resolving to updated topic detail data
 * @throws ApiError if parameters are invalid
 */
export async function updateTopicDetailFavorite(
  topicId: string,
  isFavorite: boolean
): Promise<TopicDetailData> {
  if (!isValidTopicId(topicId)) {
    throw createValidationError('topicId', topicId, 'valid topic ID');
  }

  if (typeof isFavorite !== 'boolean') {
    throw createValidationError('isFavorite', isFavorite, 'boolean');
  }

  await simulateDelay();

  // Update the master data source
  const updatedMasterTopic = updateMasterTopic(topicId, { isFavorite });

  // If topic doesn't exist, use default fallback
  const masterTopic =
    updatedMasterTopic || findMasterTopic('it-project-management')!;

  // Invalidate related caches
  cacheUtils.invalidate(`topic-detail-${topicId}`);
  cacheUtils.invalidate('topics');
  cacheUtils.invalidate(`topic-${topicId}`);

  // Return the updated topic in TopicDetailData format
  return {
    id: masterTopic.id,
    title: masterTopic.title,
    description: masterTopic.description,
    image: masterTopic.image,
    totalQuestions: masterTopic.totalQuestions,
    completedQuestions: masterTopic.completedQuestions,
    bookmarkedQuestions: masterTopic.bookmarkedQuestions || 0,
    stars: masterTopic.stars,
    questions: masterTopic.questions || [],
    isFavorite: masterTopic.isFavorite,
    wisecoinReward: masterTopic.wisecoinReward,
  };
}

// ============================================================================
// ACHIEVEMENTS API
// ============================================================================

/**
 * Fetches user achievements.
 * @returns Promise resolving to array of achievements
 */
export async function fetchAchievements(): Promise<Achievement[]> {
  const cacheKey = 'achievements';
  const cached = cacheUtils.get<Achievement[]>(cacheKey);
  if (cached) return cached;

  await simulateDelay();
  const result = [...sampleAchievements];
  cacheUtils.set(cacheKey, result);
  return result;
}

/**
 * Fetches achievement by ID.
 * @param achievementId - Achievement identifier
 * @returns Promise resolving to achievement or null if not found
 * @throws ApiError if achievementId is invalid
 */
export async function fetchAchievementById(
  achievementId: string
): Promise<Achievement | null> {
  if (!isValidAchievementId(achievementId)) {
    throw createValidationError(
      'achievementId',
      achievementId,
      'valid achievement ID'
    );
  }

  const cacheKey = generateCacheKey('achievement', achievementId);
  const cached = cacheUtils.get<Achievement | null>(cacheKey);
  if (cached !== null) return cached;

  await simulateDelay();
  const result =
    sampleAchievements.find(achievement => achievement.id === achievementId) ||
    null;
  cacheUtils.set(cacheKey, result);
  return result;
}

// ============================================================================
// BATCH API OPERATIONS
// ============================================================================

/**
 * Fetches all initial data needed for the application.
 * Useful for preloading common data during app initialization.
 * @returns Promise resolving to object containing all common data
 */
export async function fetchInitialData(): Promise<{
  categories: string[];
  difficultyNames: DifficultyLevel[];
  gameModes: GameMode[];
  gameTopics: GameTopic[];
  homeTopics: ReturnType<typeof getHomeTopics>;
  topics: Topic[];
  achievements: Achievement[];
}> {
  const cacheKey = 'initial-data';
  const cached = cacheUtils.get<ReturnType<typeof fetchInitialData>>(cacheKey);
  if (cached) return cached;

  // Use retry logic for batch loading
  const result = await withRetry(async () => {
    // Simulate batch loading with parallel requests
    const [
      categoriesData,
      difficultyNamesData,
      gameModesData,
      gameTopicsData,
      homeTopicsData,
      topicsData,
      achievementsData,
    ] = await Promise.all([
      fetchCategories(),
      fetchDifficultyNames(),
      fetchGameModes(),
      fetchGameTopics(),
      fetchHomeTopics(),
      fetchTopics(),
      fetchAchievements(),
    ]);

    return {
      categories: categoriesData,
      difficultyNames: difficultyNamesData,
      gameModes: gameModesData,
      gameTopics: gameTopicsData,
      homeTopics: homeTopicsData,
      topics: topicsData,
      achievements: achievementsData,
    };
  });

  cacheUtils.set(cacheKey, result, EXTENDED_CACHE_TTL);
  return result;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simulates API error for testing error handling.
 * @param errorMessage - Error message to throw
 * @returns Promise that rejects with the given error
 */
export async function simulateApiError(
  errorMessage: string = 'API-Fehler'
): Promise<never> {
  await simulateDelay();
  throw new ApiError(errorMessage, 500, 'SIMULATED_ERROR');
}

/**
 * Sets the API delay for all simulated requests.
 * Useful for testing different network conditions.
 * @param delayMs - Delay in milliseconds
 */
export function setApiDelay(delayMs: number): void {
  if (typeof delayMs !== 'number' || delayMs < 0) {
    throw createValidationError('delayMs', delayMs, 'positive number');
  }

  // In a real implementation, this might update a configuration value
  // For now, it's just a placeholder since we use a constant
  // console.log(
  //   `API-Verzögerung auf ${delayMs}ms gesetzt (Hinweis: Neustart erforderlich)`
  // );
}

/**
 * Clears all cached data.
 * Useful for testing or when data needs to be refreshed.
 */
export function clearCache(): void {
  cacheUtils.clear();
}

/**
 * Gets cache statistics for debugging.
 * @returns Object with cache statistics
 */
export function getCacheStats(): ReturnType<typeof cacheUtils.getStats> {
  return cacheUtils.getStats();
}

// Re-export utilities for convenience
export { ApiError, withRetry, debounce, throttle } from './utils';
