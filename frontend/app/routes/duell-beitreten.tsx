import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function DuellBeitretenPage() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const extractSessionId = (value: string): string | null => {
    // Extrahiere die Session-ID aus einem Link oder gib sie direkt zurück
    const match = value.match(/(\d+)$/);
    return match ? match[1] : null;
  };

  const handleJoin = () => {
    setError(null);
    const sessionId = extractSessionId(input.trim());
    if (!sessionId) {
      setError('Bitte gib einen gültigen Link oder eine Session-ID ein.');
      return;
    }
    navigate(`/join/${sessionId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800/80 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">
          Session beitreten
        </h1>
        <p className="text-gray-300 mb-8">
          Füge den Einladungslink oder die Session-ID ein, um einem Duell
          beizutreten.
        </p>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Link oder Session-ID"
          className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FCC822]"
        />
        <button
          className="w-full px-6 py-3 bg-[#FCC822] hover:bg-[#e0b01d] text-gray-900 font-bold rounded-lg transition-colors text-lg shadow mb-2"
          onClick={handleJoin}
        >
          Beitreten
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
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
