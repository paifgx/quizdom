/**
 * Topic questions component displaying bookmarked questions section.
 * Shows only bookmarked questions in a grid layout.
 */

import { useCallback, useMemo } from 'react';
import type { TopicQuestionsProps } from '../../types/topic-detail';
import { QuestionsGrid } from './questions-grid';
import { QuestionsHeader } from './questions-header';

/**
 * Displays the bookmarked questions for a topic.
 */
export function TopicQuestions({
  questions,
  bookmarkedCount,
  topicId,
}: TopicQuestionsProps) {
  const bookmarkedQuestions = useMemo(
    () => questions.filter(question => question.isBookmarked),
    [questions]
  );

  const handleClearBookmarks = useCallback(() => {
    if (
      !window.confirm(
        'Möchtest du wirklich alle markierten Fragen für dieses Thema löschen?'
      )
    ) {
      return;
    }

    // This logic is specific to how bookmarks are stored. Ideally, this would
    // be handled in a dedicated service or hook to abstract away localStorage
    // details and provide a cleaner interface for components.
    const keysToRemove = Object.keys(localStorage).filter(key => {
      const isTopicBookmark =
        key.startsWith('bookmarked_') && key.includes(topicId);
      const isTopicBookmarkData =
        key === `bookmarked_questions_data_${topicId}`;
      return isTopicBookmark || isTopicBookmarkData;
    });

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    // A full page reload is not ideal for user experience.
    // A better approach would be to use a state management library (like
    // React Query or SWR) to invalidate queries and refetch data seamlessly,
    // or lift state up and pass a callback to refresh the questions.
    window.location.reload();
  }, [topicId]);

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
