/**
 * Quiz list component for admin dashboard.
 * Displays a filterable, sortable list of quizzes with actions.
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import type { QuizSummary, QuizStatus, QuizDifficulty } from '../../types/quiz';

interface QuizListProps {
  quizzes: QuizSummary[];
  onStatusChange: (quizId: string, status: QuizStatus) => void;
  onDelete: (quizId: string) => void;
  onDuplicate: (quizId: string) => void;
}

/**
 * Quiz list component.
 */
export function QuizList({
  quizzes,
  onStatusChange,
  onDelete,
  onDuplicate,
}: QuizListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case 'published':
        return 'bg-green-600 text-green-100';
      case 'draft':
        return 'bg-gray-600 text-gray-100';
      case 'archived':
        return 'bg-yellow-600 text-yellow-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getStatusLabel = (status: QuizStatus) => {
    switch (status) {
      case 'published':
        return 'Veröffentlicht';
      case 'draft':
        return 'Entwurf';
      case 'archived':
        return 'Archiviert';
      default:
        return status;
    }
  };

  const getDifficultyColor = (difficulty: QuizDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-600 text-green-100';
      case 'medium':
        return 'bg-yellow-600 text-yellow-100';
      case 'hard':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: QuizDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Einfach';
      case 'medium':
        return 'Mittel';
      case 'hard':
        return 'Schwer';
      default:
        return difficulty;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {quizzes.map(quiz => (
        <div
          key={quiz.id}
          className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors duration-200"
        >
          {/* Quiz Header */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}
                  >
                    {getStatusLabel(quiz.status)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}
                  >
                    {getDifficultyLabel(quiz.difficulty)}
                  </span>
                  <span className="px-3 py-1 bg-[#FCC822] bg-opacity-20 text-[#FCC822] rounded-full text-xs font-medium">
                    {quiz.category}
                  </span>
                </div>

                <h3 className="text-white font-medium text-lg mb-2">
                  {quiz.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4">{quiz.description}</p>

                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <img
                      src="/buttons/Filter.png"
                      alt="Fragen"
                      className="h-4 w-4"
                    />
                    <span>{quiz.questionCount} Fragen</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <img
                      src="/buttons/Add.png"
                      alt="Punkte"
                      className="h-4 w-4"
                    />
                    <span>{quiz.totalPoints} Punkte</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <img
                      src="/buttons/Accept.png"
                      alt="Dauer"
                      className="h-4 w-4"
                    />
                    <span>{quiz.estimatedDuration} Min.</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <img
                      src="/buttons/Right.png"
                      alt="Gespielt"
                      className="h-4 w-4"
                    />
                    <span>{quiz.playCount}x gespielt</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to={`/admin/quizzes/${quiz.id}`}
                  className="p-2 text-[#FCC822] hover:bg-[#FCC822] hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                  title="Bearbeiten"
                >
                  <img
                    src="/buttons/Settings.png"
                    alt="Bearbeiten"
                    className="h-5 w-5"
                  />
                </Link>
                <button
                  onClick={() =>
                    setExpandedId(expandedId === quiz.id ? null : quiz.id)
                  }
                  className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Weitere Optionen"
                >
                  <img
                    src="/buttons/Down.png"
                    alt="Optionen"
                    className={`h-5 w-5 transition-transform duration-200 ${
                      expandedId === quiz.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Actions */}
          {expandedId === quiz.id && (
            <div className="px-6 pb-6 pt-0">
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    <p>
                      Erstellt am {formatDate(quiz.createdAt)} von{' '}
                      {quiz.createdBy}
                    </p>
                    <p>Zuletzt aktualisiert am {formatDate(quiz.updatedAt)}</p>
                    {quiz.averageScore > 0 && (
                      <p className="mt-1">
                        Durchschnittliche Punktzahl:{' '}
                        {quiz.averageScore.toFixed(1)}%
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {quiz.status === 'draft' && (
                      <button
                        onClick={() => onStatusChange(quiz.id, 'published')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        Veröffentlichen
                      </button>
                    )}
                    {quiz.status === 'published' && (
                      <button
                        onClick={() => onStatusChange(quiz.id, 'archived')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                      >
                        Archivieren
                      </button>
                    )}
                    {quiz.status === 'archived' && (
                      <button
                        onClick={() => onStatusChange(quiz.id, 'published')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        Reaktivieren
                      </button>
                    )}
                    <button
                      onClick={() => onDuplicate(quiz.id)}
                      className="px-4 py-2 bg-[#FCC822] text-[#061421] rounded-lg hover:bg-[#FCC822]/90 transition-colors duration-200"
                    >
                      Duplizieren
                    </button>
                    <button
                      onClick={() => onDelete(quiz.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {quizzes.length === 0 && (
        <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 p-12 text-center">
          <img
            src="/buttons/Filter.png"
            alt="Keine Quizze"
            className="h-16 w-16 mx-auto mb-4 opacity-50"
          />
          <p className="text-gray-400 text-lg">Keine Quizze gefunden.</p>
          <p className="text-gray-500 text-sm mt-2">
            Ändern Sie Ihre Suchkriterien oder erstellen Sie ein neues Quiz.
          </p>
        </div>
      )}
    </div>
  );
}
