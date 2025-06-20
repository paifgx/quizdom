import React from 'react';
import { QuizQuestion } from './quiz-question';
import { QuizButton } from './quiz-button';

export interface QuizAnswer {
  id: string;
  text: string;
}

export interface QuizData {
  question: string;
  answers: QuizAnswer[];
}

export interface QuizContainerProps {
  quizData: QuizData;
  selectedAnswer?: string;
  onAnswerSelect: (answerId: string) => void;
  onQuestionClick?: () => void;
}

/**
 * Main quiz container that combines question display with answer selection grid
 */
export function QuizContainer({
  quizData,
  selectedAnswer,
  onAnswerSelect,
  onQuestionClick,
}: QuizContainerProps) {
  return (
    <div className="max-w-4xl mx-auto p-5">
      <QuizQuestion
        question={quizData.question}
        onQuestionClick={onQuestionClick}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {quizData.answers.map(answer => (
          <QuizButton
            key={answer.id}
            text={answer.text}
            onClick={() => onAnswerSelect(answer.id)}
            selected={selectedAnswer === answer.id}
          />
        ))}
      </div>
    </div>
  );
}
