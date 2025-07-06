import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AllQuizzesSelection } from '../components/game-modes/all-quizzes-selection';
import { topicsService } from '../services/api';
import { gameService } from '../services/game';
import type { Topic, GameModeId } from '../types/game';

export default function DuellErstellenPage() {
  const [sessionLink, setSessionLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showQuizSelection, setShowQuizSelection] = useState(true);
  const navigate = useNavigate();

  // Lade Topics beim ersten Render
  useState(() => {
    topicsService
      .getAll()
      .then(setTopics)
      .catch(() => setTopics([]));
  });

  const handleSelectQuiz = async (quizId: number) => {
    setError(null);
    setCopied(false);
    try {
      // Starte eine neue competitive-Session mit Quiz
      const session = await gameService.startQuizGame(
        quizId.toString(),
        'competitive'
      );
      const link = `${window.location.origin}/join/${session.session_id}`;
      setSessionLink(link);
      setShowQuizSelection(false);
    } catch {
      setError('Fehler beim Erstellen der Session.');
    }
  };

  const handleSelectRandomFromTopic = async (topicId: string) => {
    setError(null);
    setCopied(false);
    try {
      // Starte eine neue competitive-Session mit Topic
      const session = await gameService.startTopicGame(topicId, 'competitive');
      const link = `${window.location.origin}/join/${session.session_id}`;
      setSessionLink(link);
      setShowQuizSelection(false);
    } catch {
      setError('Fehler beim Erstellen der Session.');
    }
  };

  const handleCopy = () => {
    if (sessionLink) {
      navigator.clipboard.writeText(sessionLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (showQuizSelection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800/80 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6">
            Session erstellen
          </h1>
          <p className="text-gray-300 mb-8">
            Wähle ein Quiz oder Thema für dein Duell aus.
          </p>
          <AllQuizzesSelection
            selectedMode={'competitive' as GameModeId}
            topics={topics}
            onSelectQuiz={handleSelectQuiz}
            onSelectRandomFromTopic={handleSelectRandomFromTopic}
            onBack={() => navigate('/duell')}
          />
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800/80 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">
          Session erstellt!
        </h1>
        <p className="text-gray-300 mb-4">
          Teile diesen Link mit deinem Mitspieler:
        </p>
        <div className="bg-gray-700 rounded p-3 mb-4 break-all text-[#FCC822] font-mono text-sm">
          {sessionLink}
        </div>
        <button
          className="px-4 py-2 bg-[#FCC822] hover:bg-[#e0b01d] text-gray-900 font-bold rounded-lg transition-colors text-base shadow mb-2"
          onClick={handleCopy}
        >
          {copied ? 'Kopiert!' : 'Link kopieren'}
        </button>
        <div className="mt-6">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors text-base shadow"
            onClick={() => navigate('/duell')}
          >
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
}
