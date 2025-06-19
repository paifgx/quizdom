import { ProtectedRoute } from '../components/auth/protected-route';
import { useAuth } from '../contexts/auth';

export function meta() {
  return [
    { title: 'Fortschritt & Badges | Quizdom' },
    {
      name: 'description',
      content: 'Verfolgen Sie Ihren Fortschritt und Ihre Erfolge.',
    },
  ];
}

export default function ProgressPage() {
  const { user: _user } = useAuth();

  const achievements = [
    {
      id: 'first_quiz',
      name: 'Erstes Quiz',
      description: 'Ihr erstes Quiz abgeschlossen',
      icon: '/badges/badge_book_1.png',
      earned: true,
      date: '2024-01-15',
    },
    {
      id: 'quiz_master',
      name: 'Quiz-Meister',
      description: '10 Quizzes erfolgreich abgeschlossen',
      icon: '/badges/badge_book_2.png',
      earned: true,
      date: '2024-01-20',
    },
    {
      id: 'speed_demon',
      name: 'Geschwindigkeitsdämon',
      description: 'Ein Quiz in unter 60 Sekunden abgeschlossen',
      icon: '/badges/badge_book_3.png',
      earned: false,
      progress: 75,
    },
    {
      id: 'perfectionist',
      name: 'Perfektionist',
      description: 'Ein Quiz mit 100% Genauigkeit abgeschlossen',
      icon: '/badges/badge_book_4.png',
      earned: false,
      progress: 0,
    },
  ];

  const stats = {
    totalQuizzes: 25,
    correctAnswers: 180,
    totalAnswers: 225,
    averageTime: '2:30',
    bestStreak: 12,
    currentStreak: 5,
    level: 7,
    experiencePoints: 1250,
    nextLevelXP: 1500,
  };

  const accuracy = Math.round(
    (stats.correctAnswers / stats.totalAnswers) * 100
  );
  const levelProgress = Math.round(
    (stats.experiencePoints / stats.nextLevelXP) * 100
  );

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
            Fortschritt & Badges
          </h1>
          <p className="text-gray-300 text-lg">
            Verfolgen Sie Ihren Lernfortschritt und sammeln Sie Erfolge.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#FCC822] mb-2">
              {stats.totalQuizzes}
            </div>
            <div className="text-gray-300">Abgeschlossene Quizzes</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#FCC822] mb-2">
              {accuracy}%
            </div>
            <div className="text-gray-300">Genauigkeit</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#FCC822] mb-2">
              {stats.currentStreak}
            </div>
            <div className="text-gray-300">Aktuelle Serie</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#FCC822] mb-2">
              Level {stats.level}
            </div>
            <div className="text-gray-300">Aktuelles Level</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-[#FCC822] mb-4">
            Level Fortschritt
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Level {stats.level}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-[#FFCD2E] to-[#FCC822] h-4 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <span className="text-gray-300">Level {stats.level + 1}</span>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            {stats.experiencePoints} / {stats.nextLevelXP} XP
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#FCC822] mb-6">
            Errungenschaften
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border transition-all duration-300 ${
                  achievement.earned
                    ? 'border-[#FCC822] shadow-lg shadow-[#FCC822]/20'
                    : 'border-gray-700'
                }`}
              >
                <div className="mb-4">
                  <img
                    src={achievement.icon}
                    alt={achievement.name}
                    className={`h-16 w-16 mx-auto ${
                      achievement.earned ? '' : 'opacity-50 grayscale'
                    }`}
                    onError={e => {
                      e.currentTarget.src = '/badges/badge_book_1.png';
                    }}
                  />
                </div>
                <h3
                  className={`font-bold mb-2 ${
                    achievement.earned ? 'text-[#FCC822]' : 'text-gray-400'
                  }`}
                >
                  {achievement.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {achievement.description}
                </p>
                {achievement.earned ? (
                  <p className="text-[#FCC822] text-xs">
                    Erhalten am {achievement.date}
                  </p>
                ) : achievement.progress !== undefined ? (
                  <div>
                    <div className="bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-[#FCC822] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-xs">
                      {achievement.progress}% abgeschlossen
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">
                    Noch nicht freigeschaltet
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
