import { useState } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import { useAuth } from '../contexts/auth';

export function meta() {
  return [
    { title: 'Profil | Quizdom' },
    { name: 'description', content: 'Verwalten Sie Ihr Quizdom-Profil.' },
  ];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'stats'>('profile');

  const availableAvatars = [
    '/avatars/player_male_with_greataxe.png',
    '/avatars/player_female_with_sword.png',
    '/avatars/ai_assistant_wizard.png',
    '/avatars/player_male_with_bow.png',
  ];

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-[#FCC822] text-[#061421]'
          : 'text-gray-300 hover:text-[#FCC822] hover:bg-gray-800'
      }`}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
              Profil
            </h1>
            <p className="text-gray-300 text-lg">
              Verwalten Sie Ihr Quizdom-Profil und Ihre Einstellungen.
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 mb-8 text-center">
            <div className="mb-6">
              <img
                src={user?.avatar || '/avatars/player_male_with_greataxe.png'}
                alt={`${user?.username} Avatar`}
                className="h-24 w-24 rounded-full mx-auto border-4 border-[#FCC822]"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {user?.username}
            </h2>
            <p className="text-gray-300 mb-4">{user?.email}</p>
            <div className="flex justify-center items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/wisecoin/wisecoin.png"
                  alt="Wisecoins"
                  className="h-6 w-6"
                />
                <span className="text-[#FCC822] font-bold">
                  {user?.wisecoins || 0} Wisecoins
                </span>
              </div>
              <div className="w-px h-6 bg-gray-600"></div>
              <span className="text-gray-300">
                {user?.role === 'admin' ? 'Administrator' : 'Spieler'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <nav className="flex justify-center space-x-4" role="tablist">
              <TabButton
                id="profile"
                label="Profil"
                isActive={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              />
              <TabButton
                id="settings"
                label="Einstellungen"
                isActive={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              />
              <TabButton
                id="stats"
                label="Statistiken"
                isActive={activeTab === 'stats'}
                onClick={() => setActiveTab('stats')}
              />
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8">
            {activeTab === 'profile' && (
              <div role="tabpanel" aria-labelledby="profile">
                <h3 className="text-xl font-bold text-[#FCC822] mb-6">
                  Profil bearbeiten
                </h3>
                
                {/* Avatar Selection */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-3">
                    Avatar auswählen
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {availableAvatars.map((avatar, index) => (
                      <button
                        key={index}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                          user?.avatar === avatar
                            ? 'border-[#FCC822] bg-[#FCC822] bg-opacity-20'
                            : 'border-gray-600 hover:border-[#FCC822]'
                        }`}
                        onClick={() => console.log('Avatar selected:', avatar)}
                      >
                        <img
                          src={avatar}
                          alt={`Avatar ${index + 1}`}
                          className="h-12 w-12 rounded-full mx-auto"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-gray-300 font-medium mb-2">
                      Benutzername
                    </label>
                    <input
                      type="text"
                      id="username"
                      defaultValue={user?.username}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-300 font-medium mb-2">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      defaultValue={user?.email}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button className="btn-gradient px-6 py-3 rounded-lg font-medium">
                    Änderungen speichern
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div role="tabpanel" aria-labelledby="settings">
                <h3 className="text-xl font-bold text-[#FCC822] mb-6">
                  Einstellungen
                </h3>
                <div className="space-y-6">
                  {/* Sound Settings */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Sound-Effekte</h4>
                      <p className="text-gray-400 text-sm">Aktiviert Ton bei Antworten und Erfolgen</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FCC822] peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FCC822]"></div>
                    </label>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Benachrichtigungen</h4>
                      <p className="text-gray-400 text-sm">Erhalten Sie Updates über neue Quizzes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FCC822] peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FCC822]"></div>
                    </label>
                  </div>

                  {/* Privacy */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Profil öffentlich</h4>
                      <p className="text-gray-400 text-sm">Andere können Ihre Statistiken sehen</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FCC822] peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FCC822]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div role="tabpanel" aria-labelledby="stats">
                <h3 className="text-xl font-bold text-[#FCC822] mb-6">
                  Statistiken
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gespielte Quizzes:</span>
                      <span className="text-white font-medium">25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Richtige Antworten:</span>
                      <span className="text-white font-medium">180</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Genauigkeit:</span>
                      <span className="text-[#FCC822] font-medium">80%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Beste Serie:</span>
                      <span className="text-white font-medium">12</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gesamt XP:</span>
                      <span className="text-white font-medium">1.250</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Errungenschaften:</span>
                      <span className="text-white font-medium">2 / 4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Mitglied seit:</span>
                      <span className="text-white font-medium">Januar 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Zuletzt aktiv:</span>
                      <span className="text-white font-medium">Heute</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </ProtectedRoute>
  );
} 