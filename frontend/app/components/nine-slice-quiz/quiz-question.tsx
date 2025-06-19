import React from 'react';
import { NineSlicePanel } from './nine-slice-panel';

export interface QuizQuestionProps {
  question: string;
  onQuestionClick?: () => void;
}

/**
 * Displays a quiz question with 9-slice styling optimized for readability
 */
export function QuizQuestion({ question, onQuestionClick }: QuizQuestionProps) {
  return (
    <NineSlicePanel
      className="min-h-[80px] mb-8 cursor-pointer transition-all duration-100 hover:brightness-110 focus:outline-2 focus:outline-[#fce9a5] focus:outline-offset-2"
      onClick={onQuestionClick}
    >
      <p className="text-[12px] p-4">{question}</p>
    </NineSlicePanel>
  );
}
