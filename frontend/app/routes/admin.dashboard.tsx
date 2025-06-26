import { useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import { useAuth } from '../contexts/auth';
import { translate } from '../utils/translations';

export function meta() {
  return [
    { title: translate('pageTitles.adminDashboard') },
    {
      name: 'description',
      content: translate('pageTitles.adminDashboardDescription'),
    },
  ];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-[#061421] text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
              {translate('nav.dashboard')}
            </h1>
            <p className="text-gray-300">
              Willkommen zurück, {user?.username}! Hier können Sie das
              Quizdom-System verwalten.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 bg-opacity-30 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Aktive Benutzer</p>
                  <p className="text-2xl font-bold text-[#FCC822]">1,234</p>
                </div>
                <div className="w-12 h-12 bg-[#FCC822] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#FCC822]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-30 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Gesamte Fragen</p>
                  <p className="text-2xl font-bold text-[#FCC822]">5,678</p>
                </div>
                <div className="w-12 h-12 bg-[#FCC822] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#FCC822]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-30 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Aktive Spiele</p>
                  <p className="text-2xl font-bold text-[#FCC822]">89</p>
                </div>
                <div className="w-12 h-12 bg-[#FCC822] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#FCC822]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-30 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">System Status</p>
                  <p className="text-2xl font-bold text-green-400">Online</p>
                </div>
                <div className="w-12 h-12 bg-green-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#FCC822] mb-4">
              Schnellaktionen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/admin/quizzes/new')}
                className="btn-gradient p-4 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105"
              >
                <img
                  src="/buttons/Add.png"
                  alt={translate('accessibility.add')}
                  className="h-6 w-6 mx-auto mb-2"
                />
                Neues Quiz erstellen
              </button>
              <button
                onClick={() => navigate('/admin/questions')}
                className="btn-gradient p-4 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105"
              >
                <img
                  src="/buttons/Filter.png"
                  alt="Fragenbank"
                  className="h-6 w-6 mx-auto mb-2"
                />
                Fragenbank verwalten
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="btn-gradient p-4 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105"
              >
                <img
                  src="/avatars/ai_assistant_wizard.png"
                  alt={translate('accessibility.user')}
                  className="h-6 w-6 mx-auto mb-2"
                />
                {translate('admin.manageUsers')}
              </button>
              <button
                onClick={() => navigate('/admin/logs')}
                className="btn-gradient p-4 rounded-xl text-center font-medium transition-all duration-200 hover:scale-105"
              >
                <img
                  src="/buttons/Filter.png"
                  alt={translate('accessibility.reports')}
                  className="h-6 w-6 mx-auto mb-2"
                />
                System-Logs anzeigen
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-[#FCC822] mb-4">
              Letzte Aktivitäten
            </h2>
            <div className="bg-gray-800 bg-opacity-30 rounded-xl p-6 border border-gray-700/50">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white">
                      Neuer Benutzer registriert: max.mustermann@example.com
                    </p>
                    <p className="text-gray-400 text-sm">vor 5 Minuten</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white">
                      Neue Frage hinzugefügt: "Was ist die Hauptstadt von
                      Deutschland?"
                    </p>
                    <p className="text-gray-400 text-sm">vor 15 Minuten</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white">System-Update abgeschlossen</p>
                    <p className="text-gray-400 text-sm">vor 1 Stunde</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
