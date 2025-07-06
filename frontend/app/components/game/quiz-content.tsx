import React from 'react';
import { QuizContainer, type QuizData } from '../nine-slice-quiz';
import type { Question } from '../../types/game';

interface QuizContentProps {
  quizData: QuizData;
  selectedAnswer?: string;
  onAnswerSelect: (answerId: string) => void;
  disabled: boolean;
  showCorrectAnswer?: { correct: number; selected?: number };
  waitingForOpponent: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  currentQuestion: Question;
}

/**
 * Renders the core quiz interface, including the question, answers, and bookmark button.
 */
export function QuizContent({
  quizData,
  selectedAnswer,
  onAnswerSelect,
  disabled,
  showCorrectAnswer,
  waitingForOpponent,
  isBookmarked,
  onToggleBookmark,
}: QuizContentProps) {
  return (
    <div className="relative">
      <QuizContainer
        quizData={quizData}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={onAnswerSelect}
        disabled={disabled}
        showCorrectAnswer={showCorrectAnswer}
        waitingForOpponent={waitingForOpponent}
      />
      <div className="py-4">
        <button
          onClick={onToggleBookmark}
          className={`absolute -top-10 right-0 px-3 py-1 rounded-lg transition-all flex items-center gap-2 ${
            isBookmarked
              ? 'bg-[#FCC822]/20 border-2 border-[#FCC822]'
              : 'bg-gray-800/50 border-2 border-gray-600 hover:border-gray-500'
          }`}
          title={isBookmarked ? 'Markierung entfernen' : 'Frage markieren'}
        >
          <span
            className={`text-xs font-bold ${
              isBookmarked ? 'text-[#FCC822]' : 'text-gray-400'
            }`}
          >
            {isBookmarked ? '★' : '☆'}
          </span>
          <span
            className={`text-xs font-medium hidden sm:inline ${
              isBookmarked ? 'text-[#FCC822]' : 'text-gray-400'
            }`}
          >
            {isBookmarked ? 'Markiert' : 'Markieren'}
          </span>
        </button>
      </div>
    </div>
  );
}
