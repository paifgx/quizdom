/**
 * Topics utility functions.
 * Provides reusable logic for topic filtering, sorting, and calculations.
 * Follows functional programming principles with pure functions.
 */

import type { GameTopic, SortOption, DifficultyLevel } from '../types/topics';

/**
 * Gets the difficulty name based on star rating.
 * Maps numeric star ratings to fantasy-themed difficulty levels.
 *
 * @param stars - Number of stars (1-5)
 * @returns Difficulty level name
 */
export function getDifficultyName(stars: number): DifficultyLevel {
  if (stars <= 1) return 'Anfänger';
  if (stars <= 2) return 'Lehrling';
  if (stars <= 3) return 'Geselle';
  return 'Meister';
}

/**
 * Gets the CSS color classes for difficulty badges.
 * Provides consistent styling based on star ratings.
 *
 * @param stars - Number of stars (1-5)
 * @returns Tailwind CSS classes for background and text colors
 */
export function getDifficultyColor(stars: number): string {
  if (stars <= 1) return 'bg-green-600 text-green-100';
  if (stars <= 2) return 'bg-blue-600 text-blue-100';
  if (stars <= 3) return 'bg-yellow-600 text-yellow-100';
  return 'bg-red-600 text-red-100';
}

/**
 * Calculates progress percentage for a topic.
 * Handles edge cases like zero total questions.
 *
 * @param completed - Number of completed questions
 * @param total - Total number of questions
 * @returns Progress percentage (0-100)
 */
export function getProgressPercentage(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Filters topics based on multiple criteria.
 * Applies category, difficulty, and search filters.
 *
 * @param topics - Array of topics to filter
 * @param filters - Filter criteria object
 * @returns Filtered array of topics
 */
export function filterTopics(
  topics: GameTopic[],
  filters: {
    category: string;
    difficulty: string;
    searchTerm: string;
  }
): GameTopic[] {
  return topics.filter(topic => {
    const matchesCategory =
      filters.category === 'all' || topic.category === filters.category;
    const matchesDifficulty =
      filters.difficulty === 'all' ||
      getDifficultyName(topic.stars) === filters.difficulty;
    const matchesSearch =
      topic.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      topic.description
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      topic.category.toLowerCase().includes(filters.searchTerm.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesSearch;
  });
}

/**
 * Sorts topics based on specified criteria.
 * Provides consistent sorting logic for different sort options.
 *
 * @param topics - Array of topics to sort
 * @param sortBy - Sort criteria
 * @returns Sorted array of topics
 */
export function sortTopics(
  topics: GameTopic[],
  sortBy: SortOption
): GameTopic[] {
  return [...topics].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'difficulty':
        return a.stars - b.stars;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'progress':
        return (
          b.completedQuestions / b.totalQuestions -
          a.completedQuestions / a.totalQuestions
        );
      default:
        return 0;
    }
  });
}

/**
 * Calculates topic statistics from an array of topics.
 * Provides aggregated data for dashboard display.
 *
 * @param topics - Array of topics
 * @param userWisecoins - User's current wisecoin balance
 * @returns Statistics object with calculated values
 */
export function calculateTopicStatistics(
  topics: GameTopic[],
  userWisecoins: number = 0
) {
  const totalTopics = topics.length;
  const favoriteTopics = topics.filter(topic => topic.isFavorite).length;
  const completedTopics = topics.filter(topic => topic.isCompleted).length;

  const totalQuestions = topics.reduce(
    (sum, topic) => sum + topic.totalQuestions,
    0
  );
  const completedQuestions = topics.reduce(
    (sum, topic) => sum + topic.completedQuestions,
    0
  );
  const totalProgress =
    totalQuestions > 0
      ? Math.round((completedQuestions / totalQuestions) * 100)
      : 0;

  return {
    totalTopics,
    favoriteTopics,
    completedTopics,
    totalProgress,
    userWisecoins,
  };
}
