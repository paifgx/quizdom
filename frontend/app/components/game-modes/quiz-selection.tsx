import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/game';
import type { GameModeId } from '../../types/game';

interface QuizSelectionProps {
  topicId: string;
  topicTitle: string;
  _selectedMode: GameModeId;
  onSelectQuiz: (quizId: number) => void;
  onSelectRandom: () => void;
  onBack: () => void;
}

interface PublishedQuiz {
  id: number;
  title: string;
  description?: string;
  questionCount: number;
  difficulty: number;
  playCount: number;
}

export function QuizSelection({
  topicId,
  topicTitle,
  _selectedMode,
  onSelectQuiz,
  onSelectRandom,
  onBack,
}: QuizSelectionProps) {
  const [quizzes, setQuizzes] = useState<PublishedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get published quizzes for this topic
        const topicIdNum = parseInt(topicId);
        const publishedQuizzes =
          await gameService.getPublishedQuizzes(topicIdNum);
        setQuizzes(publishedQuizzes);
      } catch (err) {
        console.error('Failed to load quizzes:', err);
        setError('Fehler beim Laden der Quizze');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [topicId]);

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-400';
    if (difficulty <= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

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
          onClick={() => window.location.reload()}
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
        <h2 className="text-2xl font-bold text-[#FCC822] mb-2">
          Wähle ein Quiz für {topicTitle}
        </h2>
        <p className="text-gray-300">
          Spiele ein vorgefertigtes Quiz oder wähle zufällige Fragen
        </p>
      </div>

      {/* Random Questions Option */}
      <div
        className="bg-gray-800/70 rounded-xl p-6 border-2 border-gray-600 hover:border-[#FCC822]/50 cursor-pointer transition-all duration-300 group"
        onClick={onSelectRandom}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectRandom();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FCC822]">
              Zufällige Fragen
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Spiele mit 10 zufällig ausgewählten Fragen aus diesem Thema
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>10 Fragen</span>
              <span>•</span>
              <span>Gemischte Schwierigkeit</span>
            </div>
          </div>
          <div className="text-4xl text-gray-500 group-hover:text-[#FCC822]">
            🎲
          </div>
        </div>
      </div>

      {/* Published Quizzes */}
      {quizzes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">
            Verfügbare Quizze
          </h3>
          {quizzes.map(quiz => (
            <div
              key={quiz.id}
              className="bg-gray-800/70 rounded-xl p-6 border-2 border-gray-600 hover:border-[#FCC822]/50 cursor-pointer transition-all duration-300 group"
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
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FCC822]">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-gray-300 text-sm mb-4">
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
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>Keine Quizze für dieses Thema verfügbar.</p>
          <p className="text-sm mt-2">
            Spiele mit zufälligen Fragen oder warte auf neue Quizze.
          </p>
        </div>
      )}

      {/* Action Buttons */}
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
