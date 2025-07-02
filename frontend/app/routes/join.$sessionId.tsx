/**
 * Join route for competitive multiplayer games.
 * Handles joining an existing session via invite link.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LoadingSpinner } from '../components/home/loading-spinner';
import { gameService } from '../services/game';

export function meta() {
  return [
    { title: 'Quiz beitreten | Quizdom' },
    {
      name: 'description',
      content: 'Tritt einem laufenden Multiplayer-Quiz bei.',
    },
  ];
}

export default function JoinSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);

  // Join session on component mount
  useEffect(() => {
    const joinSession = async () => {
      if (!sessionId) {
        navigate('/game-modes');
        return;
      }

      try {
        // Try to join the session
        const sessionInfo = await gameService.joinSession(sessionId);
        
        // Redirect to quiz game with sessionId
        // Use the quiz_id or topic_id from the response to determine the correct route
        
        if (sessionInfo.quizId) {
          // This is a quiz-based game
          navigate(`/quiz/${sessionInfo.quizId}/quiz-game?sessionId=${sessionId}`);
        } else if (sessionInfo.topicId) {
          // This is a topic-based game
          navigate(`/topics/${sessionInfo.topicId}/quiz-game?sessionId=${sessionId}`);
        } else {
          // Fallback if neither is present (shouldn't happen)
          throw new Error('Session hat keine gültige Quiz- oder Themen-ID');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sitzung konnte nicht beigetreten werden.');
        setLoading(false);
      }
    };

    joinSession();
  }, [sessionId, navigate]);

  // Handle countdown for auto-redirect on error
  useEffect(() => {
    if (error) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/game-modes');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [error, navigate]);

  // If there's an error, show an error message with auto-redirect
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800/80 rounded-xl p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Sitzung nicht verfügbar</h1>
          <p className="text-gray-300 mb-6">
            {error || 'Die Quizsitzung ist nicht mehr verfügbar oder bereits voll.'}
          </p>
          <p className="text-gray-400 mb-8">
            Du wirst in <span className="text-[#FCC822]">{countdown}</span> Sekunden zur Spielauswahl weitergeleitet.
          </p>
          <button
            onClick={() => navigate('/game-modes')}
            className="px-6 py-3 bg-[#FCC822] hover:bg-[#e0b01d] text-gray-900 font-bold rounded-lg transition-colors"
          >
            Jetzt zur Spielauswahl
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800/80 rounded-xl p-6 max-w-md w-full text-center">
        <LoadingSpinner />
        <h1 className="text-2xl font-bold text-white mt-4">
          Verbindung wird hergestellt...
        </h1>
        <p className="text-gray-300 mt-2">
          Du trittst dem Spiel bei. Bitte warten...
        </p>
      </div>
    </div>
  );
} 