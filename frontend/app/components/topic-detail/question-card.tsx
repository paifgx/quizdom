/**
 * Question card component displaying individual question information.
 * Shows question title, bookmark status, difficulty, and completion status.
 */

import { Link } from 'react-router';
import type { QuestionCardProps } from '../../types/topic-detail';
import type { QuizDifficulty } from '../../types/quiz';
import { getDifficultyColor, getDifficultyName } from '../../utils/difficulty';

/**
 * Displays individual question information in a card format.
 */
export function QuestionCard({ question, topicId }: QuestionCardProps) {
  return (
    <Link to={`/topics/${topicId}/questions/${question.id}`}>
      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-[#FCC822] transition-all duration-200 cursor-pointer hover:scale-105 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3 flex-1">
          <QuestionTitle title={question.title} />
          {question.isBookmarked && (
            <img
              src="/stars/star_full.png"
              alt="Markiert"
              className="h-5 w-5 flex-shrink-0"
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <DifficultyBadge difficulty={question.difficulty} />
          {question.isCompleted && (
            <img
              src="/buttons/Accept.png"
              alt="Abgeschlossen"
              className="h-4 w-4"
            />
          )}
        </div>
      </div>
    </Link>
  );
}

interface QuestionTitleProps {
  title: string;
}

function QuestionTitle({ title }: QuestionTitleProps) {
  const truncatedTitle =
    title.length > 100 ? title.substring(0, 100) + '...' : title;

  return (
    <div
      className="text-sm font-semibold text-[#FCC822] leading-tight"
      title={title}
    >
      {truncatedTitle}
    </div>
  );
}

interface DifficultyBadgeProps {
  difficulty: QuizDifficulty;
}

function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <div
      className={`text-xs px-2 py-1 rounded ${getDifficultyColor(difficulty)}`}
    >
      {getDifficultyName(difficulty)}
    </div>
  );
}
