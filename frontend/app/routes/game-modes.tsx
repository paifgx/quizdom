import { ProtectedRoute } from '../components/auth/protected-route';

export function meta() {
  return [
    { title: 'Spielmodi | Quizdom' },
    {
      name: 'description',
      content: 'Wählen Sie aus verschiedenen spannenden Spielmodi.',
    },
  ];
}

export default function GameModesPage() {
  const gameModes = [
    {
      id: 'classic',
      name: 'Classic Quiz',
      description: 'Klassisches Quiz mit Multiple-Choice-Fragen',
      icon: '/playmodi/classic.png',
      difficulty: 'Einfach',
      rewards: '10-20 Wisecoins',
    },
    {
      id: 'time-attack',
      name: 'Time Attack',
      description: 'Schnelle Antworten unter Zeitdruck',
      icon: '/playmodi/time_attack.png',
      difficulty: 'Mittel',
      rewards: '15-30 Wisecoins',
    },
    {
      id: 'competitive',
      name: 'Competitive',
      description: 'Spiele gegen andere Spieler',
      icon: '/playmodi/competitive.png',
      difficulty: 'Schwer',
      rewards: '25-50 Wisecoins',
    },
    {
      id: 'daily-challenge',
      name: 'Daily Challenge',
      description: 'Tägliche Herausforderung mit besonderen Belohnungen',
      icon: '/playmodi/daily_challenge.png',
      difficulty: 'Variabel',
      rewards: 'Spezial Badges',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#FCC822] mb-4">Spielmodi</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Wählen Sie aus verschiedenen spannenden Spielmodi und stellen Sie
            Ihr Wissen unter Beweis.
          </p>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {gameModes.map(mode => (
            <div
              key={mode.id}
              className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 hover:border-[#FCC822] transition-all duration-300 hover:scale-105 cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  // TODO: Implement game mode selection
                  // console.log(`Starting ${mode.name}`);
                }
              }}
            >
              <div className="text-center">
                <div className="mb-4">
                  <img
                    src={mode.icon}
                    alt={mode.name}
                    className="h-16 w-16 mx-auto"
                    onError={e => {
                      e.currentTarget.src = '/buttons/Play.png';
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-[#FCC822] mb-2">
                  {mode.name}
                </h3>
                <p className="text-gray-300 mb-4">{mode.description}</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>
                    <span className="font-medium">Schwierigkeit:</span>{' '}
                    {mode.difficulty}
                  </p>
                  <p>
                    <span className="font-medium">Belohnungen:</span>{' '}
                    {mode.rewards}
                  </p>
                </div>
                <button className="btn-gradient mt-4 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                  Spielen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
