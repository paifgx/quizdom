/**
 * Custom hook for topic detail page functionality.
 * Manages topic data, favorite status, and navigation logic.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { TopicDetailData, TopicQuestion } from '../types/topic-detail';
import { topicsService } from '../services/api';

interface UseTopicDetailOptions {
  topicId?: string;
}

interface UseTopicDetailReturn {
  topic: TopicDetailData | null;
  isLoading: boolean;
  error: Error | null;
  toggleFavorite: () => void;
  handleBack: () => void;
  navigateToGameModes: () => void;
}

interface BookmarkedQuestionData {
  id: string;
  text: string;
  answers: string[];
  topicTitle: string;
  bookmarkedAt: string;
}

/**
 * Safely loads and parses data from localStorage.
 * @param key The localStorage key.
 * @param defaultValue The default value to return on error or if not found.
 * @returns The parsed data or the default value.
 */
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch (error) {
    console.error(`Error loading '${key}' from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Creates TopicQuestion objects from bookmarked question data.
 * This is used to display bookmarked questions on the topic detail page.
 */
function createTopicQuestionsFromBookmarks(
  bookmarkedQuestionIds: string[],
  bookmarkedQuestionsData: Record<string, BookmarkedQuestionData>,
  topicTitle: string
): TopicQuestion[] {
  return bookmarkedQuestionIds.map((questionId, index) => {
    const questionData = bookmarkedQuestionsData[questionId];

    if (questionData) {
      return {
        id: questionData.id,
        number: index + 1,
        title: questionData.text,
        questionText: questionData.text,
        answers: questionData.answers.map(
          (answer: string, answerIndex: number) => ({
            id: (answerIndex + 1).toString(),
            text: answer,
          })
        ),
        correctAnswerId: '1',
        isBookmarked: true,
        isCompleted: false,
        difficulty: 2,
      };
    }

    return {
      id: questionId,
      number: index + 1,
      title: `Markierte Frage ${index + 1}`,
      questionText: `Diese markierte Frage aus "${topicTitle}" konnte nicht geladen werden.`,
      answers: [
        { id: '1', text: 'Antwort A' },
        { id: '2', text: 'Antwort B' },
        { id: '3', text: 'Antwort C' },
        { id: '4', text: 'Antwort D' },
      ],
      correctAnswerId: '1',
      isBookmarked: true,
      isCompleted: false,
      difficulty: 2,
    };
  });
}

/**
 * Manages topic detail page state and interactions.
 * Handles topic data loading, favorite toggling, and navigation.
 *
 * @param options - Configuration options including topic ID.
 * @returns Object containing topic data, loading/error states, and action handlers.
 */
export function useTopicDetail({
  topicId,
}: UseTopicDetailOptions): UseTopicDetailReturn {
  const navigate = useNavigate();

  const [topic, setTopic] = useState<TopicDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load topic data
  useEffect(() => {
    const loadTopicData = async () => {
      if (!topicId) {
        setIsLoading(false);
        setError(new Error('Topic ID is not provided.'));
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const topicData = await topicsService.getById(topicId);
        if (!topicData) {
          throw new Error('Topic not found.');
        }

        const bookmarkedQuestionIds = loadFromStorage<string[]>(
          `bookmarked_${topicData.title}`,
          []
        );
        const bookmarkedQuestionsData = loadFromStorage<
          Record<string, BookmarkedQuestionData>
        >(`bookmarked_questions_data_${topicData.title}`, {});
        const bookmarkedQuestions = createTopicQuestionsFromBookmarks(
          bookmarkedQuestionIds,
          bookmarkedQuestionsData,
          topicData.title
        );
        const favoriteIds = loadFromStorage<string[]>('favoriteTopicIds', []);
        const isFavorite = favoriteIds.includes(topicData.id);
        const completedKey = `completed_${topicData.id}`;
        const completed = loadFromStorage<string[]>(completedKey, []);

        setTopic({
          ...topicData,
          completedQuestions: completed.length,
          bookmarkedQuestions: bookmarkedQuestionIds.length,
          questions: bookmarkedQuestions,
          isFavorite,
        });
      } catch (err) {
        const fetchError =
          err instanceof Error ? err : new Error('An unknown error occurred');
        console.error('Failed to load topic data:', fetchError);
        setError(fetchError);
        setTopic(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopicData();
    const onFocus = () => loadTopicData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [topicId]);

  /**
   * Toggles the favorite status of the current topic.
   * Updates local state and persists the change to localStorage.
   */
  const toggleFavorite = useCallback(() => {
    setTopic(prevTopic => {
      if (!prevTopic) return null;

      const newIsFavorite = !prevTopic.isFavorite;
      const favoriteIds = loadFromStorage<string[]>('favoriteTopicIds', []);

      const updatedFavoriteIds = newIsFavorite
        ? [...favoriteIds, prevTopic.id]
        : favoriteIds.filter(id => id !== prevTopic.id);

      localStorage.setItem(
        'favoriteTopicIds',
        JSON.stringify(updatedFavoriteIds)
      );

      return {
        ...prevTopic,
        isFavorite: newIsFavorite,
      };
    });
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const navigateToGameModes = useCallback(() => {
    if (topic?.id) {
      navigate(`/game-modes?topic=${topic.id}`);
    }
  }, [navigate, topic?.id]);

  return {
    topic,
    isLoading,
    error,
    toggleFavorite,
    handleBack,
    navigateToGameModes,
  };
}
