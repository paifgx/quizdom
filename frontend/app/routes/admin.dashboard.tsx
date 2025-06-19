import { ProtectedRoute } from '../components/auth/protected-route';
import { useAuth } from '../contexts/auth';

export function meta() {
  return [
    { title: 'Admin Dashboard | Quizdom' },
    { name: 'description', content: 'Administrationsbereich für Quizdom.' },
  ];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const dashboardStats = {
    totalUsers: 1247,
    activeUsers: 89,
    totalQuizzes: 156,
    totalQuestions: 2340,
    averageScore: 78.5,
    systemUptime: '99.8%',
  };

  const recentActivity = [
    {
      id: 1,
      user: 'max_mustermann',
      action: 'Quiz abgeschlossen',
      details: 'Wissenschaft Quiz (85% Genauigkeit)',
      timestamp: '2 Minuten',
      type: 'quiz_completion',
    },
    {
      id: 2,
      user: 'anna_schmidt',
      action: 'Neuer Benutzer registriert',
      details: 'E-Mail: anna.schmidt@email.com',
      timestamp: '15 Minuten',
      type: 'user_registration',
    },
    {
      id: 3,
      user: 'peter_wagner',
      action: 'Badge erhalten',
      details: 'Quiz-Meister Badge freigeschaltet',
      timestamp: '32 Minuten',
      type: 'achievement',
    },
    {
      id: 4,
      user: 'system',
      action: 'Neue Fragen hinzugefügt',
      details: '15 neue Fragen zur Kategorie Geschichte',
      timestamp: '1 Stunde',
      type: 'system',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completion':
        return '/buttons/Accept.png';
      case 'user_registration':
        return '/buttons/Add.png';
      case 'achievement':
        return '/badges/badge_book_1.png';
      case 'system':
        return '/buttons/Settings.png';
      default:
        return '/buttons/Home.png';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz_completion':
        return 'text-green-400';
      case 'user_registration':
        return 'text-blue-400';
      case 'achievement':
        return 'text-[#FCC822]';
      case 'system':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Willkommen zurück, {user?.username}! Hier ist eine Übersicht über
            das System.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">
                  Benutzer gesamt
                </p>
                <p className="text-3xl font-bold text-[#FCC822]">
                  {dashboardStats.totalUsers.toLocaleString()}
                </p>
                <p className="text-green-400 text-sm">+12% diesen Monat</p>
              </div>
              <div className="p-3 bg-[#FCC822] bg-opacity-20 rounded-lg">
                <img
                  src="/avatars/player_male_with_greataxe.png"
                  alt="Users"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">
                  Aktive Benutzer
                </p>
                <p className="text-3xl font-bold text-[#FCC822]">
                  {dashboardStats.activeUsers}
                </p>
                <p className="text-green-400 text-sm">Letzten 24h</p>
              </div>
              <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                <img src="/buttons/Play.png" alt="Active" className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">
                  Quizzes gesamt
                </p>
                <p className="text-3xl font-bold text-[#FCC822]">
                  {dashboardStats.totalQuizzes}
                </p>
                <p className="text-blue-400 text-sm">In 15 Kategorien</p>
              </div>
              <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                <img
                  src="/badges/badge_book_1.png"
                  alt="Quizzes"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">
                  Fragen gesamt
                </p>
                <p className="text-3xl font-bold text-[#FCC822]">
                  {dashboardStats.totalQuestions.toLocaleString()}
                </p>
                <p className="text-purple-400 text-sm">+45 diese Woche</p>
              </div>
              <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
                <img
                  src="/buttons/Filter.png"
                  alt="Questions"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Ø Punktzahl</p>
                <p className="text-3xl font-bold text-[#FCC822]">
                  {dashboardStats.averageScore}%
                </p>
                <p className="text-green-400 text-sm">
                  +2.3% vs. letzten Monat
                </p>
              </div>
              <div className="p-3 bg-[#FCC822] bg-opacity-20 rounded-lg">
                <img
                  src="/stars/star_full.png"
                  alt="Score"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">
                  System Uptime
                </p>
                <p className="text-3xl font-bold text-[#FCC822]">
                  {dashboardStats.systemUptime}
                </p>
                <p className="text-green-400 text-sm">Letzten 30 Tage</p>
              </div>
              <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                <img
                  src="/buttons/Settings.png"
                  alt="System"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-[#FCC822] mb-6">
            Letzte Aktivitäten
          </h2>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200"
              >
                <div className="flex-shrink-0">
                  <img
                    src={getActivityIcon(activity.type)}
                    alt={activity.action}
                    className="h-6 w-6"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium truncate">
                      {activity.user}
                    </p>
                    <span
                      className={`text-sm ${getActivityColor(activity.type)}`}
                    >
                      {activity.action}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    {activity.details}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-gray-400 text-xs">
                    vor {activity.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-[#FCC822] hover:text-[#FFCD2E] font-medium text-sm transition-colors duration-200">
              Alle Aktivitäten anzeigen →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-gradient p-4 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105">
            <img
              src="/buttons/Add.png"
              alt="Add"
              className="h-6 w-6 mx-auto mb-2"
            />
            Neue Frage hinzufügen
          </button>
          <button className="btn-gradient p-4 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105">
            <img
              src="/avatars/ai_assistant_wizard.png"
              alt="Users"
              className="h-6 w-6 mx-auto mb-2"
            />
            Benutzer verwalten
          </button>
          <button className="btn-gradient p-4 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105">
            <img
              src="/buttons/Settings.png"
              alt="Settings"
              className="h-6 w-6 mx-auto mb-2"
            />
            System-Einstellungen
          </button>
          <button className="btn-gradient p-4 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105">
            <img
              src="/buttons/Filter.png"
              alt="Reports"
              className="h-6 w-6 mx-auto mb-2"
            />
            Berichte erstellen
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
