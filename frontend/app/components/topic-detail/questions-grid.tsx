import type { TopicQuestionsProps } from '../../types/topic-detail';
import { QuestionCard } from './question-card';

interface QuestionsGridProps {
  questions: TopicQuestionsProps['questions'];
  topicId: string;
}

/**
 * Grid layout for displaying question cards.
 *
 * Shows a message if no questions are bookmarked.
 */
export function QuestionsGrid({ questions, topicId }: QuestionsGridProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <img
            src="/stars/star_empty.png"
            alt="Keine markierten Fragen"
            className="h-16 w-16 mx-auto opacity-50"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          Noch keine markierten Fragen
        </h3>
        <p className="text-gray-400 mb-4 max-w-md mx-auto">
          Du hast noch keine Fragen markiert. Starte ein Quiz und klicke auf den
          Stern (☆) bei Fragen, die du später wiederholen möchtest.
        </p>
        <div className="text-sm text-gray-500">
          💡 Tipp: Markierte Fragen werden hier angezeigt und können später
          erneut geübt werden.
        </div>
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
