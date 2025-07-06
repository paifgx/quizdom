import React from 'react';
import type { QuizStatus } from '../../types/quiz';

interface StatusActionButtonsProps {
  isNewQuiz: boolean;
  quizStatus: QuizStatus | null;
  saving: boolean;
  handleStatusChange: (newStatus: QuizStatus) => void;
}

/**
 * Reusable component for quiz status action buttons.
 * Displays appropriate buttons based on current quiz status.
 * Handles publish, archive, and reactivate actions.
 */
export function StatusActionButtons({
  isNewQuiz,
  quizStatus,
  saving,
  handleStatusChange,
}: StatusActionButtonsProps) {
  // Don't show status buttons for new quizzes
  if (isNewQuiz) {
    return null;
  }

  return (
    <>
      {quizStatus === 'draft' && (
        <button
          onClick={() => handleStatusChange('published')}
          disabled={saving}
          className="btn-secondary px-4 py-2 rounded-lg font-medium"
        >
          Veröffentlichen
        </button>
      )}
      {quizStatus === 'published' && (
        <button
          onClick={() => handleStatusChange('archived')}
          disabled={saving}
          className="btn-secondary px-4 py-2 rounded-lg font-medium"
        >
          Archivieren
        </button>
      )}
      {quizStatus === 'archived' && (
        <button
          onClick={() => handleStatusChange('draft')}
          disabled={saving}
          className="btn-secondary px-4 py-2 rounded-lg font-medium"
        >
          Reaktivieren
        </button>
      )}
    </>
  );
}
