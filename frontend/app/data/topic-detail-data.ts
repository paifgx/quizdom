/**
 * Mock data for topic detail page.
 * Provides sample topic data with English content for development and testing.
 */

import type { TopicDetailData, Achievement } from '../types/topic-detail';

/**
 * Fantasy-themed difficulty names based on star ratings.
 * Provides consistent difficulty naming across the application.
 */
export const difficultyNames: Record<number, string> = {
  1: 'Beginner',
  2: 'Apprentice',
  3: 'Journeyman',
  4: 'Master',
  5: 'Grandmaster',
};

/**
 * Sample achievements data for topic detail display.
 * Represents user progress and unlocked achievements.
 */
export const sampleAchievements: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    image: '/badges/badge_1_64x64.png',
    isUnlocked: true,
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    image: '/badges/badge_2_64x64.png',
    isUnlocked: false,
  },
  {
    id: 'knowledge-master',
    name: 'Knowledge Master',
    image: '/badges/badge_3_64x64.png',
    isUnlocked: false,
  },
  {
    id: 'bookworm-1',
    name: 'Bookworm I',
    image: '/badges/badge_book_1.png',
    isUnlocked: true,
  },
  {
    id: 'bookworm-2',
    name: 'Bookworm II',
    image: '/badges/badge_book_2.png',
    isUnlocked: false,
  },
];

/**
 * Mock topic data for development and testing.
 * Provides realistic sample data for different topics.
 */
export const mockTopicData: Record<string, TopicDetailData> = {
  'it-project-management': {
    id: 'it-project-management',
    title: 'IT Project Management',
    description:
      'Comprehensive questions about IT project management, methodologies, and best practices. Learn about agile, waterfall, and hybrid approaches.',
    image: '/topics/it-project-management.png',
    totalQuestions: 150,
    completedQuestions: 10,
    bookmarkedQuestions: 2,
    stars: 2, // Medium difficulty
    questions: [
      {
        id: '1',
        number: 1,
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'easy',
      },
      {
        id: '2',
        number: 2,
        isBookmarked: true,
        isCompleted: false,
        difficulty: 'medium',
      },
      {
        id: '3',
        number: 3,
        isBookmarked: false,
        isCompleted: false,
        difficulty: 'hard',
      },
    ],
    isFavorite: true,
    wisecoinReward: 200,
  },
  mathematics: {
    id: 'mathematics',
    title: 'Mathematics',
    description:
      'Mathematical fundamentals and advanced concepts for all learning levels. From basic arithmetic to complex calculus.',
    image: '/topics/math.png',
    totalQuestions: 100,
    completedQuestions: 0,
    bookmarkedQuestions: 0,
    stars: 4, // Hard difficulty
    questions: [],
    isFavorite: false,
    wisecoinReward: 250,
  },
  physics: {
    id: 'physics',
    title: 'Physics',
    description:
      'Explore the fundamental laws of nature through interactive questions about mechanics, thermodynamics, and quantum physics.',
    image: '/topics/physics.png',
    totalQuestions: 120,
    completedQuestions: 25,
    bookmarkedQuestions: 5,
    stars: 3, // Medium difficulty
    questions: [
      {
        id: '1',
        number: 1,
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'easy',
      },
      {
        id: '2',
        number: 2,
        isBookmarked: false,
        isCompleted: true,
        difficulty: 'medium',
      },
    ],
    isFavorite: true,
    wisecoinReward: 180,
  },
  history: {
    id: 'history',
    title: 'History',
    description:
      'Journey through time with questions about ancient civilizations, world wars, and historical events that shaped our world.',
    image: '/topics/history.png',
    totalQuestions: 200,
    completedQuestions: 50,
    bookmarkedQuestions: 8,
    stars: 1, // Easy difficulty
    questions: [
      {
        id: '1',
        number: 1,
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'easy',
      },
    ],
    isFavorite: false,
    wisecoinReward: 150,
  },
};

/**
 * Retrieves topic data by ID.
 * Falls back to default topic if the requested topic is not found.
 *
 * @param topicId - The unique identifier of the topic
 * @returns Topic data object or default topic
 */
export function getTopicData(topicId: string): TopicDetailData {
  return mockTopicData[topicId] || mockTopicData['it-project-management'];
}

/**
 * Gets difficulty name based on star rating.
 * Provides consistent difficulty naming across the application.
 *
 * @param stars - Star rating (1-5)
 * @returns Difficulty name string
 */
export function getDifficultyName(stars: number): string {
  return difficultyNames[stars] || difficultyNames[1];
}
