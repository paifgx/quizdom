import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';

export function meta() {
  return [
    { title: 'Quiz bearbeiten | Quizdom Admin' },
    {
      name: 'description',
      content: 'Erstellen oder bearbeiten Sie ein Quiz.',
    },
  ];
}

export default function AdminQuizEditPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const isNewQuiz = quizId === 'new';

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
            {isNewQuiz ? 'Neues Quiz erstellen' : 'Quiz bearbeiten'}
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Diese Seite wird bald verfügbar sein.
          </p>
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
          >
            Zurück zur Quiz-Übersicht
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
