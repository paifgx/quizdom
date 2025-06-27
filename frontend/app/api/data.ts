/**
 * Data types and utilities for the Quizdom application.
 * Essential types and constants without mock data.
 */

import type { GameMode } from '../types/game';
import type { GameTopic, DifficultyLevel } from '../types/topics';
import type { TopicDetailData, Achievement } from '../types/topic-detail';
import type { QuizDifficulty } from '../types/quiz';

// ============================================================================
// STATIC REFERENCE DATA
// ============================================================================

/**
 * Available categories for topic filtering.
 */
export const categories = [
  'Wissenschaft',
  'Geschichte',
  'Geographie',
  'Sport',
  'Kunst & Kultur',
  'Technologie',
  'Natur',
  'Mathematik',
];

/**
 * Fantasy-themed difficulty names based on star ratings.
 */
export const difficultyNames: DifficultyLevel[] = [
  'Anfänger',
  'Lehrling',
  'Geselle',
  'Meister',
  'Großmeister',
];

/**
 * Difficulty name mapping for star ratings.
 */
export const difficultyNameMap: Record<number, string> = {
  1: 'Anfänger',
  2: 'Lehrling',
  3: 'Geselle',
  4: 'Meister',
  5: 'Großmeister',
};

// ============================================================================
// GAME MODES DATA
// ============================================================================

/**
 * Available game modes for quiz gameplay.
 */
export const gameModes: GameMode[] = [
  {
    id: 'solo',
    name: 'Solo Mission',
    description:
      'Spiele in deinem eigenen Tempo und verbessere dein Wissen. Perfekt zum Lernen und zur Selbsteinschätzung.',
    icon: '/playmodi/SOLO_withoutText.PNG',
  },
  {
    id: 'competitive',
    name: 'Duell',
    description:
      'Fordere einen anderen Spieler in Echtzeit-Wettbewerb heraus. Schnell und aufregend!',
    icon: '/playmodi/COMP_withoutText.PNG',
  },
  {
    id: 'collaborative',
    name: 'Team Battle',
    description:
      'Schließe dich mit Teamkollegen zusammen, um gegen andere anzutreten. Arbeite zusammen und entwickle Strategien.',
    icon: '/playmodi/COLL_withoutText.PNG',
  },
];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Comprehensive topic data structure.
 */
interface ComprehensiveTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  totalQuestions: number;
  completedQuestions: number;
  bookmarkedQuestions?: number;
  image: string;
  stars: number;
  popularity: number;
  wisecoinReward: number;
  isCompleted: boolean;
  isFavorite: boolean;
  showOnHome?: boolean;
  questions?: Array<{
    id: string;
    number: number;
    title: string;
    questionText: string;
    answers: Array<{ id: string; text: string }>;
    correctAnswerId: string;
    isBookmarked: boolean;
    isCompleted: boolean;
    difficulty: QuizDifficulty;
  }>;
}

// ============================================================================
// PLACEHOLDER DATA - WILL BE REPLACED BY REAL API CALLS
// ============================================================================

/**
 * Empty topics array - will be populated by real API data.
 */
const masterTopics: ComprehensiveTopic[] = [];

/**
 * Empty achievements array - will be populated by real API data.
 */
export const sampleAchievements: Achievement[] = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Updates a topic in the master data source.
 * This ensures all derived data stays synchronized.
 */
export function updateMasterTopic(
  topicId: string,
  updates: Partial<ComprehensiveTopic>
): ComprehensiveTopic | null {
  const topicIndex = masterTopics.findIndex(topic => topic.id === topicId);
  if (topicIndex === -1) return null;

  masterTopics[topicIndex] = { ...masterTopics[topicIndex], ...updates };
  return masterTopics[topicIndex];
}

/**
 * Finds a topic in the master data source.
 */
export function findMasterTopic(topicId: string): ComprehensiveTopic | null {
  return masterTopics.find(topic => topic.id === topicId) || null;
}

/**
 * Game topics used in game mode selection.
 * Returns empty array until real API data is available.
 */
export function getGameTopics(): GameTopic[] {
  return masterTopics.map(topic => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    category: topic.category,
    totalQuestions: topic.totalQuestions,
    completedQuestions: topic.completedQuestions,
    image: topic.image,
    stars: topic.stars,
    popularity: topic.popularity,
    wisecoinReward: topic.wisecoinReward,
    isCompleted: topic.isCompleted,
    isFavorite: topic.isFavorite,
  }));
}

/**
 * Home page topics for dashboard display.
 * Returns empty array until real API data is available.
 */
export function getHomeTopics() {
  return masterTopics
    .filter(topic => topic.showOnHome)
    .map(topic => ({
      id: topic.id,
      title: topic.title,
      image: topic.image,
      description: topic.description,
    }));
}

/**
 * Full topics data for topics page with complete metadata.
 * Returns empty array until real API data is available.
 */
export function getTopics(): GameTopic[] {
  return masterTopics.map(topic => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    category: topic.category,
    totalQuestions: topic.totalQuestions,
    completedQuestions: topic.completedQuestions,
    image: topic.image,
    stars: topic.stars,
    popularity: topic.popularity,
    wisecoinReward: topic.wisecoinReward,
    isCompleted: topic.isCompleted,
    isFavorite: topic.isFavorite,
  }));
}

/**
 * Topic detail data for individual topic pages.
 * Returns empty object until real API data is available.
 */
export function getTopicDetailData(): Record<string, TopicDetailData> {
  return Object.fromEntries(
    masterTopics.map(topic => [
      topic.id,
      {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        image: topic.image,
        totalQuestions: topic.totalQuestions,
        completedQuestions: topic.completedQuestions,
        bookmarkedQuestions: topic.bookmarkedQuestions || 0,
        stars: topic.stars,
        questions: topic.questions || [],
        isFavorite: topic.isFavorite,
        wisecoinReward: topic.wisecoinReward,
      },
    ])
  );
}

// Backward compatibility - export static versions for components that need them
export const gameTopics = getGameTopics();
export const homeTopics = getHomeTopics();
export const topics = getTopics();
export const topicDetailData = getTopicDetailData();

// Export the master topics for API mutations (now empty)
export { masterTopics };
