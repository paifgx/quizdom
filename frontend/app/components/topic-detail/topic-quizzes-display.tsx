import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/game';
import { useNavigate } from 'react-router';
import type { GameModeId } from '../../types/game';

interface TopicQuizzesDisplayProps {
  topicId: string;
  topicTitle: string;
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

export function TopicQuizzesDisplay({
  topicId,
  topicTitle,
}: TopicQuizzesDisplayProps) {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<PublishedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeId>('solo');

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch published quizzes for this specific topic
        const topicIdNum = parseInt(topicId);
        const topicQuizzes = await gameService.getPublishedQuizzes(topicIdNum);
        setQuizzes(topicQuizzes);
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

  const handleSelectQuiz = (quizId: number) => {
    // Navigate to quiz game with the specific quiz ID
    navigate(`/quiz/${quizId}/quiz-game?mode=${selectedMode}`);
  };

  const handleSelectRandom = () => {
    // Navigate to quiz game with topic ID for random questions
    navigate(`/topics/${topicId}/quiz-game?mode=${selectedMode}`);
  };

  const handleModeSelect = (mode: GameModeId) => {
    setSelectedMode(mode);
  };

  if (loading) {
    return (
      <div className="bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm mb-6 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
          <p className="text-gray-300">Lade verfügbare Quizze...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm mb-6 p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FCC822] text-gray-900 rounded-lg hover:bg-[#FCC822]/90"
          >
            Neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm mb-6 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#FCC822] mb-2">
          Quizze für {topicTitle}
        </h2>
        <p className="text-gray-300">
          Wähle ein Quiz oder spiele mit zufälligen Fragen
        </p>
      </div>

      {/* Game Mode Selection */}
      <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Spielmodus wählen:
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'solo', name: 'Solo Mission', icon: '🎯' },
            { id: 'collaborative', name: 'Team Battle', icon: '👥' },
            { id: 'competitive', name: 'Duell', icon: '⚔️' },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.id as GameModeId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                selectedMode === mode.id
                  ? 'border-[#FCC822] bg-[#FCC822]/10 text-[#FCC822]'
                  : 'border-gray-600 text-gray-300 hover:border-[#FCC822]/50 hover:text-[#FCC822]'
              }`}
            >
              <span className="text-lg">{mode.icon}</span>
              <span className="font-medium">{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Random Questions Option */}
      <div
        className="bg-gray-700/70 rounded-xl p-6 border-2 border-gray-600 hover:border-[#FCC822]/50 cursor-pointer transition-all duration-300 group mb-6"
        onClick={handleSelectRandom}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectRandom();
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
              className="bg-gray-700/70 rounded-xl p-6 border-2 border-gray-600 hover:border-[#FCC822]/50 cursor-pointer transition-all duration-300 group"
              onClick={() => handleSelectQuiz(quiz.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectQuiz(quiz.id);
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
    </div>
  );
}
