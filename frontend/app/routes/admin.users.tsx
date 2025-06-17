import { useState } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import { MainNav } from '../components/navigation/main-nav';

export function meta() {
  return [
    { title: 'Benutzer verwalten | Quizdom Admin' },
    { name: 'description', content: 'Verwalten Sie Benutzerkonten und Berechtigungen.' },
  ];
}

interface User {
  id: string;
  username: string;
  email: string;
  role: 'player' | 'admin';
  avatar: string;
  wisecoins: number;
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'banned';
  quizzesCompleted: number;
  averageScore: number;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('registeredAt');

  const sampleUsers: User[] = [
    {
      id: '1',
      username: 'max_mustermann',
      email: 'max.mustermann@email.com',
      role: 'player',
      avatar: '/avatars/player_male_with_greataxe.png',
      wisecoins: 1250,
      registeredAt: '2024-01-15',
      lastLogin: '2024-01-25',
      status: 'active',
      quizzesCompleted: 45,
      averageScore: 78.5,
    },
    {
      id: '2',
      username: 'anna_schmidt',
      email: 'anna.schmidt@email.com',
      role: 'player',
      avatar: '/avatars/player_female_with_sword.png',
      wisecoins: 890,
      registeredAt: '2024-01-10',
      lastLogin: '2024-01-24',
      status: 'active',
      quizzesCompleted: 32,
      averageScore: 85.2,
    },
    {
      id: '3',
      username: 'admin_user',
      email: 'admin@quizdom.com',
      role: 'admin',
      avatar: '/avatars/ai_assistant_wizard.png',
      wisecoins: 0,
      registeredAt: '2023-12-01',
      lastLogin: '2024-01-25',
      status: 'active',
      quizzesCompleted: 0,
      averageScore: 0,
    },
    {
      id: '4',
      username: 'inactive_user',
      email: 'inactive@email.com',
      role: 'player',
      avatar: '/avatars/player_male_with_bow.png',
      wisecoins: 150,
      registeredAt: '2023-11-15',
      lastLogin: '2023-12-20',
      status: 'inactive',
      quizzesCompleted: 8,
      averageScore: 62.3,
    },
  ];

  const filteredUsers = sampleUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-green-100';
      case 'inactive':
        return 'bg-yellow-600 text-yellow-100';
      case 'banned':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Inaktiv';
      case 'banned':
        return 'Gesperrt';
      default:
        return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'player':
        return 'Spieler';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const daysSinceLastLogin = (lastLogin: string) => {
    const days = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <MainNav />
      <div className="min-h-screen bg-[#061421]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
                Benutzer verwalten
              </h1>
              <p className="text-gray-300 text-lg">
                Verwalten Sie Benutzerkonten, Rollen und Berechtigungen.
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105">
                <img src="/buttons/Add.png" alt="Add" className="inline h-5 w-5 mr-2" />
                Neuen Benutzer anlegen
              </button>
              <button className="bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200">
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#FCC822]">
                  {sampleUsers.length}
                </p>
                <p className="text-gray-300 text-sm">Gesamt Benutzer</p>
              </div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {sampleUsers.filter(u => u.status === 'active').length}
                </p>
                <p className="text-gray-300 text-sm">Aktive Benutzer</p>
              </div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {sampleUsers.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-gray-300 text-sm">Administratoren</p>
              </div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">
                  {sampleUsers.filter(u => daysSinceLastLogin(u.lastLogin) > 30).length}
                </p>
                <p className="text-gray-300 text-sm">Inaktiv (30+ Tage)</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-gray-300 font-medium mb-2">
                  Suchen
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Benutzername oder E-Mail suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-gray-300 font-medium mb-2">
                  Rolle
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                >
                  <option value="all">Alle Rollen</option>
                  <option value="player">Spieler</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-gray-300 font-medium mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                  <option value="banned">Gesperrt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-[#FCC822]">
                Benutzer ({filteredUsers.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 bg-opacity-50">
                  <tr className="text-left">
                    <th className="px-6 py-3 text-gray-300 font-medium">Benutzer</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Rolle</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Status</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Wisecoins</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Quizzes</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Ø Punkte</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Letzter Login</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar}
                            alt={`${user.username} Avatar`}
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-600 bg-opacity-20 text-purple-300'
                            : 'bg-blue-600 bg-opacity-20 text-blue-300'
                        }`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <img src="/wisecoin/wisecoin.png" alt="Wisecoins" className="h-4 w-4" />
                          <span className="text-[#FCC822] font-medium">{user.wisecoins.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{user.quizzesCompleted}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{user.averageScore}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white text-sm">{formatDate(user.lastLogin)}</p>
                          <p className="text-gray-400 text-xs">
                            vor {daysSinceLastLogin(user.lastLogin)} Tagen
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            className="p-2 text-[#FCC822] hover:bg-[#FCC822] hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                            title="Bearbeiten"
                          >
                            <img src="/buttons/Settings.png" alt="Edit" className="h-4 w-4" />
                          </button>
                          {user.status !== 'banned' && (
                            <button
                              className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                              title="Sperren"
                            >
                              <img src="/buttons/Close.png" alt="Ban" className="h-4 w-4" />
                            </button>
                          )}
                          {user.status === 'banned' && (
                            <button
                              className="p-2 text-green-400 hover:bg-green-400 hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                              title="Entsperren"
                            >
                              <img src="/buttons/Accept.png" alt="Unban" className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <img src="/avatars/ai_assistant_wizard.png" alt="No users" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">
                  Keine Benutzer gefunden.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Ändern Sie Ihre Suchkriterien oder fügen Sie neue Benutzer hinzu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 