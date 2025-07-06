import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/game';
import type { PublishedQuiz } from '../types/quiz';

export function useTopicQuizzes(topicId: string) {
  const [quizzes, setQuizzes] = useState<PublishedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const topicIdNum = parseInt(topicId, 10);
      if (isNaN(topicIdNum)) {
        // Or handle this case as you see fit
        throw new Error('Invalid topic ID');
      }

      const topicQuizzes = await gameService.getPublishedQuizzes(topicIdNum);
      setQuizzes(topicQuizzes);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Fehler beim Laden der Quizze');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  return { quizzes, loading, error, reload: loadQuizzes };
}
