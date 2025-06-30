/**
 * Quiz-related type definitions for administration.
 */

/**
 * Quiz status type.
 */
export type QuizStatus = 'draft' | 'published' | 'archived';

/**
 * Quiz difficulty levels - matching backend 1-5 system.
 */
export type QuizDifficulty = 1 | 2 | 3 | 4 | 5;

/**
 * Question type enum.
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank',
}

/**
 * Answer option for a quiz question.
 */
export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

/**
 * Quiz question interface.
 */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  explanation?: string;
  points: number;
  timeLimit: number; // in seconds
  answers: AnswerOption[];
  imageUrl?: string;
  order: number;
}

/**
 * Quiz settings interface.
 */
export interface QuizSettings {
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showExplanations: boolean;
  allowSkipping: boolean;
  showProgress: boolean;
  passingScore: number; // percentage
  maxAttempts?: number;
}

/**
 * Quiz interface for administration.
 */
export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: QuizDifficulty;
  status: QuizStatus;
  questions: QuizQuestion[];
  settings: QuizSettings;
  tags: string[];
  imageUrl?: string;
  estimatedDuration: number; // in minutes
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  publishedAt?: string;
}

/**
 * Quiz summary for list views.
 */
export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  difficulty: QuizDifficulty;
  status: QuizStatus;
  questionCount: number;
  totalPoints: number;
  estimatedDuration: number;
  playCount: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Create quiz payload.
 */
export interface CreateQuizPayload {
  title: string;
  description: string;
  difficulty: QuizDifficulty;
  tags: string[];
  imageUrl?: string;
  settings: QuizSettings;
  questionIds?: string[];
}

/**
 * Create quiz batch payload - creates quiz with questions in one operation.
 */
export interface CreateQuizBatchPayload {
  title: string;
  description: string;
  difficulty: QuizDifficulty;
  estimatedDuration?: number;
  questions: Array<{
    content: string;
    explanation?: string;
    difficulty: QuizDifficulty;
    answers: Array<{
      content: string;
      isCorrect: boolean;
    }>;
  }>;
}

/**
 * Update quiz payload.
 */
export interface UpdateQuizPayload extends Partial<CreateQuizPayload> {
  status?: QuizStatus;
  questionIds?: string[];
}

/**
 * Quiz filter options.
 */
export interface QuizFilters {
  search?: string;
  difficulty?: QuizDifficulty;
  status?: QuizStatus;
  createdBy?: string;
  tags?: string[];
}

/**
 * Quiz statistics.
 */
export interface QuizStatistics {
  totalQuizzes: number;
  publishedQuizzes: number;
  draftQuizzes: number;
  totalQuestions: number;
  totalPlays: number;
  averageCompletionRate: number;
}
