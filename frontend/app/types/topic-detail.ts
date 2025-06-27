/**
 * Types for topic detail page functionality.
 * Provides type safety for topic questions, data structures, and component props.
 */

import type { QuizDifficulty } from './quiz';

export interface TopicQuestion {
  id: string;
  number: number;
  title: string;
  questionText: string;
  answers: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  isBookmarked: boolean;
  isCompleted: boolean;
  difficulty: QuizDifficulty;
}

export interface TopicDetailData {
  id: string;
  title: string;
  description: string;
  image: string;
  totalQuestions: number;
  completedQuestions: number;
  bookmarkedQuestions: number;
  stars: number;
  questions: TopicQuestion[];
  isFavorite: boolean;
  wisecoinReward: number;
}

export interface TopicDetailPageProps {
  topicId?: string;
}

export interface TopicHeaderProps {
  topic: TopicDetailData;
  onToggleFavorite: () => void;
}

export interface TopicStatsProps {
  topic: TopicDetailData;
}

export interface TopicAchievementsProps {
  achievements: Achievement[];
}

export interface TopicQuestionsProps {
  questions: TopicQuestion[];
  bookmarkedCount: number;
  topicId: string;
}

export interface QuestionCardProps {
  question: TopicQuestion;
  topicId: string;
}

export interface BackNavigationProps {
  onBack: () => void;
}

export interface Achievement {
  id: string;
  name: string;
  image: string;
  isUnlocked: boolean;
}
