/**
 * Custom hook for topic detail page functionality.
 * Manages topic data, favorite status, and navigation logic.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { TopicDetailData, TopicQuestion } from '../types/topic-detail';
import { topicsService } from '../services/api';

interface UseTopicDetailOptions {
  /** Topic ID from URL parameters */
  topicId?: string;
}

interface UseTopicDetailReturn {
  /** Current topic data */
  topic: TopicDetailData;
  /** Function to toggle favorite status */
  toggleFavorite: () => void;
  /** Function to handle back navigation */
  handleBack: () => void;
  /** Function to navigate to game modes */
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
 * Loads bookmarked questions from localStorage for a specific topic
 */
function loadBookmarkedQuestionsFromStorage(topicTitle: string): string[] {
  try {
    const stored = localStorage.getItem(`bookmarked_${topicTitle}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(
      'Error loading bookmarked questions from localStorage:',
      error
    );
  }
  return [];
}

/**
 * Loads complete bookmarked question data from localStorage
 */
function loadBookmarkedQuestionsDataFromStorage(
  topicTitle: string
): Record<string, BookmarkedQuestionData> {
  try {
    const stored = localStorage.getItem(
      `bookmarked_questions_data_${topicTitle}`
    );
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(
      'Error loading bookmarked questions data from localStorage:',
      error
    );
  }
  return {};
}

/**
 * Creates TopicQuestion objects from bookmarked question data
 */
function createTopicQuestionsFromBookmarks(
  bookmarkedQuestionIds: string[],
  bookmarkedQuestionsData: Record<string, BookmarkedQuestionData>,
  topicTitle: string
): TopicQuestion[] {
  return bookmarkedQuestionIds.map((questionId, index) => {
    const questionData = bookmarkedQuestionsData[questionId];

    if (questionData) {
      // Use the actual question data
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
        correctAnswerId: '1', // We don't store the correct answer, so default to first
        isBookmarked: true,
        isCompleted: false,
        difficulty: 2, // Default difficulty
      };
    } else {
      // Fallback for missing data
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
    }
  });
}

/**
 * Manages topic detail page state and interactions.
 * Handles topic data loading, favorite toggling, and navigation.
 *
 * @param options - Configuration options including topic ID
 * @returns Object containing topic data and action handlers
 */
export function useTopicDetail({
  topicId,
}: UseTopicDetailOptions): UseTopicDetailReturn {
  const navigate = useNavigate();

  // Initialize topic state with loading placeholder
  const [topic, setTopic] = useState<TopicDetailData>({
    id: '',
    title: '',
    description: '',
    image: '',
    totalQuestions: 0,
    completedQuestions: 0,
    bookmarkedQuestions: 0,
    stars: 1,
    questions: [],
    isFavorite: false,
    wisecoinReward: 0,
  });

  // Load topic data
  useEffect(() => {
    const loadTopicData = async () => {
      try {
        if (!topicId) return;

        const topicData = await topicsService.getById(topicId);
        if (topicData) {
          // Load bookmarked questions from localStorage
          const bookmarkedQuestionIds = loadBookmarkedQuestionsFromStorage(
            topicData.title
          );
          const bookmarkedQuestionsData =
            loadBookmarkedQuestionsDataFromStorage(topicData.title);
          const bookmarkedQuestions = createTopicQuestionsFromBookmarks(
            bookmarkedQuestionIds,
            bookmarkedQuestionsData,
            topicData.title
          );

          // Load favorite status from localStorage
          const favoriteIds = JSON.parse(
            localStorage.getItem('favoriteTopicIds') || '[]'
          );
          const isFavorite = favoriteIds.includes(topicData.id);

          // Convert GameTopic to TopicDetailData format
          const topicDetailData: TopicDetailData = {
            id: topicData.id,
            title: topicData.title,
            description: topicData.description,
            image: topicData.image,
            totalQuestions: topicData.totalQuestions,
            completedQuestions: topicData.completedQuestions,
            bookmarkedQuestions: bookmarkedQuestionIds.length,
            stars: topicData.stars,
            questions: bookmarkedQuestions, // Use bookmarked questions from localStorage
            isFavorite: isFavorite,
            wisecoinReward: topicData.wisecoinReward,
          };
          setTopic(topicDetailData);
        }
      } catch {
        // Error intentionally ignored
      }
    };

    loadTopicData();
  }, [topicId]);

  /**
   * Toggles the favorite status of the current topic.
   * Updates local state to reflect the change immediately.
   */
  const toggleFavorite = useCallback(() => {
    setTopic(prevTopic => {
      const newIsFavorite = !prevTopic.isFavorite;

      // Update localStorage
      const favoriteIds = JSON.parse(
        localStorage.getItem('favoriteTopicIds') || '[]'
      );
      let updatedFavoriteIds;

      if (newIsFavorite) {
        // Add to favorites
        updatedFavoriteIds = [...favoriteIds, prevTopic.id];
      } else {
        // Remove from favorites
        updatedFavoriteIds = favoriteIds.filter(
          (id: string) => id !== prevTopic.id
        );
      }

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

  /**
   * Handles back navigation to the previous page.
   * Uses browser history to go back one step.
   */
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * Navigates to game modes page with current topic context.
   * Passes topic ID as query parameter for game mode selection.
   */
  const navigateToGameModes = useCallback(() => {
    navigate(`/game-modes?topic=${topic.id}`);
  }, [navigate, topic.id]);

  return {
    topic,
    toggleFavorite,
    handleBack,
    navigateToGameModes,
  };
}
