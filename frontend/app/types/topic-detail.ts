/**
 * Types for topic detail page functionality.
 * Provides type safety for topic questions, data structures, and component props.
 */

export interface TopicQuestion {
  /** Unique identifier for the question */
  id: string;
  /** Question number for display */
  number: number;
  /** Short descriptive title of the question */
  title: string;
  /** Whether the question is bookmarked by the user */
  isBookmarked: boolean;
  /** Whether the question has been completed */
  isCompleted: boolean;
  /** Difficulty level of the question */
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TopicDetailData {
  /** Unique identifier for the topic */
  id: string;
  /** Display title of the topic */
  title: string;
  /** Detailed description of the topic */
  description: string;
  /** Image URL for the topic */
  image: string;
  /** Total number of questions in the topic */
  totalQuestions: number;
  /** Number of completed questions */
  completedQuestions: number;
  /** Number of bookmarked questions */
  bookmarkedQuestions: number;
  /** Star rating indicating difficulty (1-5) */
  stars: number;
  /** Array of questions in the topic */
  questions: TopicQuestion[];
  /** Whether the topic is marked as favorite */
  isFavorite: boolean;
  /** Wisecoin reward for completing the topic */
  wisecoinReward: number;
}

export interface TopicDetailPageProps {
  /** Optional topic ID from URL parameters */
  topicId?: string;
}

export interface TopicHeaderProps {
  /** Topic data to display in header */
  topic: TopicDetailData;
  /** Callback for toggling favorite status */
  onToggleFavorite: () => void;
}

export interface TopicStatsProps {
  /** Topic data to display statistics for */
  topic: TopicDetailData;
}

export interface TopicAchievementsProps {
  /** Array of achievement data to display */
  achievements: Achievement[];
}

export interface TopicQuestionsProps {
  /** Array of questions to display */
  questions: TopicQuestion[];
  /** Number of bookmarked questions */
  bookmarkedCount: number;
}

export interface QuestionCardProps {
  /** Question data to display */
  question: TopicQuestion;
}

export interface BackNavigationProps {
  /** Callback for back navigation */
  onBack: () => void;
}

export interface Achievement {
  /** Unique identifier for the achievement */
  id: string;
  /** Display name of the achievement */
  name: string;
  /** Image URL for the achievement badge */
  image: string;
  /** Whether the achievement is unlocked */
  isUnlocked: boolean;
}
