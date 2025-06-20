/**
 * Topics-related type definitions for the quiz application.
 * Defines interfaces for topic data, filtering, and sorting functionality.
 */

export interface GameTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  totalQuestions: number;
  completedQuestions: number;
  image: string;
  stars: number;
  popularity: number;
  wisecoinReward: number;
  isCompleted: boolean;
  isFavorite: boolean;
}

export type SortOption = 'popularity' | 'difficulty' | 'title' | 'progress';
export type DifficultyLevel =
  | 'Anfänger'
  | 'Lehrling'
  | 'Geselle'
  | 'Meister'
  | 'Großmeister';

export interface TopicFilters {
  category: string;
  difficulty: string;
  searchTerm: string;
  sortBy: SortOption;
}

export interface TopicStatistics {
  totalTopics: number;
  favoriteTopics: number;
  completedTopics: number;
  totalProgress: number;
  userWisecoins: number;
}
