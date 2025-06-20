/**
 * Topic questions component displaying bookmarked questions section.
 * Shows questions grid with navigation to view all bookmarked questions.
 */

import React from 'react';
import { Link } from 'react-router';
import type { TopicQuestionsProps } from '../../types/topic-detail';
import { QuestionCard } from './question-card';

/**
 * Displays bookmarked questions section with grid layout and navigation.
 * Shows question count and provides link to view all bookmarked questions.
 *
 * @param props - Component properties including questions data and navigation info
 * @returns JSX element for questions section
 */
export function TopicQuestions({
  questions,
  bookmarkedCount,
  topicId,
}: TopicQuestionsProps) {
  return (
    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-600 backdrop-blur-sm mb-6">
      <QuestionsHeader bookmarkedCount={bookmarkedCount} topicId={topicId} />
      <QuestionsGrid questions={questions} />
    </div>
  );
}

interface QuestionsHeaderProps {
  /** Number of bookmarked questions */
  bookmarkedCount: number;
  /** Topic ID for navigation */
  topicId: string;
}

/**
 * Questions section header with count and navigation link.
 * Displays bookmarked questions count and link to view all.
 *
 * @param props - Header properties including count and topic ID
 * @returns JSX element for questions header
 */
function QuestionsHeader({ bookmarkedCount, topicId }: QuestionsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-white">
        Bookmarked Questions: {bookmarkedCount}
      </h2>
      <Link
        to={`/quizzes?topic=${topicId}&bookmarked=true`}
        className="text-[#FCC822] hover:text-[#FFCD2E] text-sm font-medium transition-colors"
      >
        View All
      </Link>
    </div>
  );
}

interface QuestionsGridProps {
  /** Array of questions to display */
  questions: TopicQuestionsProps['questions'];
}

/**
 * Questions grid component displaying question cards in responsive layout.
 * Arranges question cards in a grid with proper spacing and responsive design.
 *
 * @param props - Grid properties including questions array
 * @returns JSX element for questions grid
 */
function QuestionsGrid({ questions }: QuestionsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map(question => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}
