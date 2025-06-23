/**
 * Topic questions component displaying bookmarked questions section.
 * Shows only bookmarked questions in a grid layout.
 */

import type { TopicQuestionsProps } from '../../types/topic-detail';
import { QuestionCard } from './question-card';

/**
 * Displays bookmarked questions section with grid layout.
 * Shows question count and displays only bookmarked questions directly.
 *
 * @param props - Component properties including questions data
 * @returns JSX element for questions section
 */
export function TopicQuestions({
  questions,
  bookmarkedCount,
  topicId,
}: TopicQuestionsProps) {
  // Filter to show only bookmarked questions
  const bookmarkedQuestions = questions.filter(
    question => question.isBookmarked
  );

  return (
    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-600 backdrop-blur-sm mb-6">
      <QuestionsHeader bookmarkedCount={bookmarkedCount} />
      <QuestionsGrid questions={bookmarkedQuestions} topicId={topicId} />
    </div>
  );
}

interface QuestionsHeaderProps {
  /** Number of bookmarked questions */
  bookmarkedCount: number;
}

/**
 * Questions section header with count in German.
 * Displays bookmarked questions count without navigation link.
 *
 * @param props - Header properties including count
 * @returns JSX element for questions header
 */
function QuestionsHeader({ bookmarkedCount }: QuestionsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-white">
        Markierte Fragen: {bookmarkedCount}
      </h2>
    </div>
  );
}

interface QuestionsGridProps {
  /** Array of questions to display */
  questions: TopicQuestionsProps['questions'];
  /** ID of the topic */
  topicId: string;
}

/**
 * Questions grid component displaying question cards in responsive layout.
 * Arranges question cards in a grid with proper spacing and responsive design.
 * Shows a message when no bookmarked questions are available.
 *
 * @param props - Grid properties including questions array
 * @returns JSX element for questions grid
 */
function QuestionsGrid({ questions, topicId }: QuestionsGridProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">
          Keine markierten Fragen verfügbar. Markiere Fragen, um sie hier zu
          sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map(question => (
        <QuestionCard key={question.id} question={question} topicId={topicId} />
      ))}
    </div>
  );
}
