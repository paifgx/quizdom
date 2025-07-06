import { useNavigate } from 'react-router';

export default function DuellOverviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800/80 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">Duell-Modus</h1>
        <p className="text-gray-300 mb-8">
          Wähle eine Option, um ein Duell zu starten oder einem beizutreten.
        </p>
        <div className="flex flex-col gap-6">
          <button
            className="px-6 py-3 bg-[#FCC822] hover:bg-[#e0b01d] text-gray-900 font-bold rounded-lg transition-colors text-lg shadow"
            onClick={() => navigate('/duell/erstellen')}
          >
            Session erstellen
          </button>
          <button
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors text-lg shadow"
            onClick={() => navigate('/duell/beitreten')}
          >
            Session beitreten
          </button>
        </div>
      </div>
    </div>
  );
}
