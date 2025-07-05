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

  const handleClearBookmarks = () => {
    if (
      window.confirm(
        'Möchtest du wirklich alle markierten Fragen für dieses Thema löschen?'
      )
    ) {
      // Try to get topic title from localStorage keys
      const localStorageKeys = Object.keys(localStorage);
      const bookmarkedKeys = localStorageKeys.filter(key =>
        key.startsWith('bookmarked_')
      );
      const bookmarkedDataKeys = localStorageKeys.filter(key =>
        key.startsWith('bookmarked_questions_data_')
      );

      // Remove all bookmarked keys
      for (const key of bookmarkedKeys) {
        localStorage.removeItem(key);
      }

      // Remove all bookmarked data keys
      for (const key of bookmarkedDataKeys) {
        localStorage.removeItem(key);
      }

      // Reload the page to reflect changes
      window.location.reload();
    }
  };

  return (
    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-600 backdrop-blur-sm mb-6">
      <QuestionsHeader
        bookmarkedCount={bookmarkedCount}
        onClearBookmarks={handleClearBookmarks}
        hasBookmarks={bookmarkedQuestions.length > 0}
      />
      <QuestionsGrid questions={bookmarkedQuestions} topicId={topicId} />
    </div>
  );
}

interface QuestionsHeaderProps {
  /** Number of bookmarked questions */
  bookmarkedCount: number;
  /** Function to clear all bookmarks */
  onClearBookmarks: () => void;
  /** Whether there are any bookmarks */
  hasBookmarks: boolean;
}

/**
 * Questions section header with count in German.
 * Displays bookmarked questions count and clear button when applicable.
 *
 * @param props - Header properties including count and clear function
 * @returns JSX element for questions header
 */
function QuestionsHeader({
  bookmarkedCount,
  onClearBookmarks,
  hasBookmarks,
}: QuestionsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-white">
        Markierte Fragen: {bookmarkedCount}
      </h2>
      {hasBookmarks && (
        <button
          onClick={onClearBookmarks}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          title="Alle markierten Fragen löschen"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Alle löschen
        </button>
      )}
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
