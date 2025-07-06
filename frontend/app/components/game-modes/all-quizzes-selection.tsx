import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { gameService } from '../../services/game';
import { gameModes } from '../../api/data';
import type { GameModeId, Topic } from '../../types/game';

interface AllQuizzesSelectionProps {
  selectedMode: GameModeId;
  topics: Topic[];
  onSelectQuiz: (quizId: number) => void;
  onBack: () => void;
}

interface PublishedQuiz {
  id: number;
  title: string;
  description?: string;
  questionCount: number;
  difficulty: number;
  playCount: number;
  topicId?: number;
}

interface TopicWithQuizzes {
  topic: Topic;
  quizzes: PublishedQuiz[];
}

const getDifficultyStars = (difficulty: number) => {
  return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
};

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 2) return 'text-green-400';
  if (difficulty <= 3) return 'text-yellow-400';
  return 'text-red-400';
};

export function AllQuizzesSelection({
  selectedMode,
  topics,
  onSelectQuiz,
  onBack,
}: AllQuizzesSelectionProps) {
  const [allQuizzes, setAllQuizzes] = useState<PublishedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const quizzes = await gameService.getPublishedQuizzes();
      setAllQuizzes(quizzes);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Fehler beim Laden der Quizze');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const topicsWithQuizzes = useMemo(() => {
    const topicsMap = new Map<string, TopicWithQuizzes>();

    topics.forEach(topic => {
      topicsMap.set(topic.id, {
        topic,
        quizzes: [],
      });
    });

    allQuizzes.forEach(quiz => {
      const topicIdStr = quiz.topicId?.toString();

      if (topicIdStr) {
        const topicEntry = topicsMap.get(topicIdStr);
        if (topicEntry) {
          topicEntry.quizzes.push(quiz);
        }
      }
    });

    return Array.from(topicsMap.values()).filter(
      t => t.quizzes.length > 0 || t.topic.totalQuestions > 0
    );
  }, [allQuizzes, topics]);

  const modeName = useMemo(
    () => gameModes.find(m => m.id === selectedMode)?.name || selectedMode,
    [selectedMode]
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
        <p className="text-gray-300">Lade verfügbare Quizze...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadQuizzes}
          className="px-4 py-2 bg-[#FCC822] text-gray-900 rounded-lg hover:bg-[#FCC822]/90"
        >
          Neu laden
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-[#FCC822] mb-2">
          Wähle ein Quiz
        </h1>
        <p className="text-gray-300 text-lg">
          Spielmodus: <span className="font-semibold">{modeName}</span>
        </p>
      </div>

      {/* Show topics with quizzes */}
      {topicsWithQuizzes.map(({ topic, quizzes }) => (
        <div key={topic.id} className="space-y-4">
          <h2 className="text-xl font-semibold text-[#FCC822]">
            {topic.title}
          </h2>

          {quizzes.map(quiz => (
            <div
              key={quiz.id}
              className="bg-gray-800/70 rounded-xl p-4 border-2 border-gray-600 hover:border-[#FCC822]/50 cursor-pointer transition-all duration-300 group"
              onClick={() => onSelectQuiz(quiz.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectQuiz(quiz.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FCC822]">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-gray-400 text-sm mb-2">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{quiz.questionCount} Fragen</span>
                    <span>•</span>
                    <span className={getDifficultyColor(quiz.difficulty)}>
                      {getDifficultyStars(quiz.difficulty)}
                    </span>
                    <span>•</span>
                    <span>{quiz.playCount}x gespielt</span>
                  </div>
                </div>
                <div className="text-2xl text-gray-500 group-hover:text-[#FCC822]">
                  📝
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {topicsWithQuizzes.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">Keine Quizze verfügbar</p>
          <p className="text-sm">
            Es sind noch keine Quizze veröffentlicht worden.
          </p>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
        >
          Zurück
        </button>
      </div>
    </div>
  );
}
