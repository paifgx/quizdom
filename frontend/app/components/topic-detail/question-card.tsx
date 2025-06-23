/**
 * Question card component displaying individual question information.
 * Shows question title, bookmark status, difficulty, and completion status.
 */

import { Link } from 'react-router-dom';
import type { QuestionCardProps } from '../../types/topic-detail';

/**
 * Displays individual question information in a card format.
 * Shows question title, bookmark status, difficulty level, and completion status.
 *
 * @param props - Component properties including question data
 * @returns JSX element for question card
 */
export function QuestionCard({ question, topicId }: QuestionCardProps) {
  return (
    <Link to={`/topics/${topicId}/questions/${question.id}`}>
      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-[#FCC822] transition-all duration-200 cursor-pointer hover:scale-105 h-full">
        <div className="flex items-center justify-between mb-3">
          <QuestionTitle title={question.title} />
          <BookmarkIndicator isBookmarked={question.isBookmarked} />
        </div>

        <div className="flex items-center justify-between">
          <DifficultyBadge difficulty={question.difficulty} />
          <CompletionIndicator isCompleted={question.isCompleted} />
        </div>
      </div>
    </Link>
  );
}

interface QuestionTitleProps {
  /** Question title to display */
  title: string;
}

/**
 * Question title component displaying the question's short title.
 * Uses golden color to highlight the question title with proper text wrapping.
 *
 * @param props - Title properties including question title
 * @returns JSX element for question title
 */
function QuestionTitle({ title }: QuestionTitleProps) {
  return (
    <div className="text-lg font-bold text-[#FCC822] leading-tight">
      {title}
    </div>
  );
}

interface BookmarkIndicatorProps {
  /** Whether the question is bookmarked */
  isBookmarked: boolean;
}

/**
 * Bookmark indicator component showing bookmark status.
 * Displays star icon when question is bookmarked.
 *
 * @param props - Bookmark properties including bookmark status
 * @returns JSX element for bookmark indicator
 */
function BookmarkIndicator({ isBookmarked }: BookmarkIndicatorProps) {
  if (!isBookmarked) return null;

  return (
    <img
      src="/stars/star_full.png"
      alt="Markiert"
      className="h-5 w-5 flex-shrink-0"
    />
  );
}

interface DifficultyBadgeProps {
  /** Difficulty level of the question */
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Difficulty badge component with color-coded difficulty levels.
 * Provides visual indication of question complexity.
 *
 * @param props - Difficulty properties including difficulty level
 * @returns JSX element for difficulty badge
 */
function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-500/20 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'hard':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDifficultyText = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'Einfach';
      case 'medium':
        return 'Mittel';
      case 'hard':
        return 'Schwer';
      default:
        return diff;
    }
  };

  return (
    <div
      className={`text-xs px-2 py-1 rounded ${getDifficultyStyles(difficulty)}`}
    >
      {getDifficultyText(difficulty)}
    </div>
  );
}

interface CompletionIndicatorProps {
  /** Whether the question is completed */
  isCompleted: boolean;
}

/**
 * Completion indicator component showing completion status.
 * Displays checkmark icon when question is completed.
 *
 * @param props - Completion properties including completion status
 * @returns JSX element for completion indicator
 */
function CompletionIndicator({ isCompleted }: CompletionIndicatorProps) {
  if (!isCompleted) return null;

  return (
    <img src="/buttons/Accept.png" alt="Abgeschlossen" className="h-4 w-4" />
  );
}
