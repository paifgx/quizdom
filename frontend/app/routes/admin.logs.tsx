import { useState } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';

export function meta() {
  return [
    { title: 'System Logs | Quizdom Admin' },
    {
      name: 'description',
      content: 'Überwachen Sie Systemaktivitäten und Logs.',
    },
  ];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: 'user' | 'quiz' | 'system' | 'security' | 'performance';
  message: string;
  details?: string;
  userId?: string;
  ipAddress?: string;
}

export default function AdminLogsPage() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  const sampleLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-25T14:30:25Z',
      level: 'info',
      category: 'user',
      message: 'Benutzer max_mustermann hat sich angemeldet',
      details: 'Erfolgreiche Authentifizierung über E-Mail',
      userId: 'user_123',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: '2024-01-25T14:28:15Z',
      level: 'error',
      category: 'quiz',
      message: 'Fehler beim Laden der Quiz-Daten',
      details: 'DatabaseConnectionException: Connection timeout after 30s',
      ipAddress: '192.168.1.100',
    },
    {
      id: '3',
      timestamp: '2024-01-25T14:25:10Z',
      level: 'warning',
      category: 'security',
      message: 'Verdächtiger Login-Versuch erkannt',
      details: 'Mehrfache fehlgeschlagene Anmeldeversuche von derselben IP',
      ipAddress: '203.0.113.45',
    },
    {
      id: '4',
      timestamp: '2024-01-25T14:20:05Z',
      level: 'info',
      category: 'system',
      message: 'Systemwartung abgeschlossen',
      details: 'Datenbankoptimierung und Cache-Clearing erfolgreich',
    },
    {
      id: '5',
      timestamp: '2024-01-25T14:15:00Z',
      level: 'debug',
      category: 'performance',
      message: 'API-Antwortzeit überschreitet Grenzwert',
      details: 'GET /api/v1/quizzes: 2.3s (Grenzwert: 2.0s)',
      ipAddress: '192.168.1.100',
    },
    {
      id: '6',
      timestamp: '2024-01-25T14:10:30Z',
      level: 'info',
      category: 'user',
      message: 'Neuer Benutzer registriert',
      details: 'anna_schmidt (anna.schmidt@email.com) hat sich registriert',
      userId: 'user_456',
      ipAddress: '192.168.1.200',
    },
  ];

  const filteredLogs = sampleLogs.filter(log => {
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesCategory =
      selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details &&
        log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesLevel && matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-600 text-red-100 border-red-500';
      case 'warning':
        return 'bg-yellow-600 text-yellow-100 border-yellow-500';
      case 'info':
        return 'bg-blue-600 text-blue-100 border-blue-500';
      case 'debug':
        return 'bg-gray-600 text-gray-100 border-gray-500';
      default:
        return 'bg-gray-600 text-gray-100 border-gray-500';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '/buttons/Close.png';
      case 'warning':
        return '/buttons/Filter.png';
      case 'info':
        return '/buttons/Accept.png';
      case 'debug':
        return '/buttons/Settings.png';
      default:
        return '/buttons/Home.png';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user':
        return '/avatars/player_male_with_greataxe.png';
      case 'quiz':
        return '/badges/badge_book_1.png';
      case 'system':
        return '/buttons/Settings.png';
      case 'security':
        return '/buttons/Close.png';
      case 'performance':
        return '/buttons/Filter.png';
      default:
        return '/buttons/Home.png';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('de-DE');
  };

  const getLogStats = () => {
    const total = sampleLogs.length;
    const errors = sampleLogs.filter(log => log.level === 'error').length;
    const warnings = sampleLogs.filter(log => log.level === 'warning').length;
    const info = sampleLogs.filter(log => log.level === 'info').length;

    return { total, errors, warnings, info };
  };

  const stats = getLogStats();

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
              System Logs
            </h1>
            <p className="text-gray-300 text-lg">
              Überwachen Sie Systemaktivitäten, Fehler und
              Sicherheitsereignisse.
            </p>
          </div>
          <div className="flex space-x-4">
            <button className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105">
              <img
                src="/buttons/Filter.png"
                alt="Export"
                className="inline h-5 w-5 mr-2"
              />
              Export Logs
            </button>
            <button className="bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200">
              <img
                src="/buttons/Delete.png"
                alt="Clear"
                className="inline h-5 w-5 mr-2"
              />
              Logs löschen
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Gesamt Logs</p>
                <p className="text-3xl font-bold text-[#FCC822]">
                  {stats.total}
                </p>
                <p className="text-gray-400 text-sm">Letzte 24h</p>
              </div>
              <div className="p-3 bg-[#FCC822] bg-opacity-20 rounded-lg">
                <img
                  src="/buttons/Filter.png"
                  alt="Total"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Fehler</p>
                <p className="text-3xl font-bold text-red-400">
                  {stats.errors}
                </p>
                <p className="text-gray-400 text-sm">Kritische Ereignisse</p>
              </div>
              <div className="p-3 bg-red-500 bg-opacity-20 rounded-lg">
                <img
                  src="/buttons/Close.png"
                  alt="Errors"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Warnungen</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {stats.warnings}
                </p>
                <p className="text-gray-400 text-sm">
                  Benötigen Aufmerksamkeit
                </p>
              </div>
              <div className="p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
                <img
                  src="/buttons/Filter.png"
                  alt="Warnings"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">
                  Informationen
                </p>
                <p className="text-3xl font-bold text-blue-400">{stats.info}</p>
                <p className="text-gray-400 text-sm">Normale Aktivitäten</p>
              </div>
              <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                <img src="/buttons/Accept.png" alt="Info" className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="block text-gray-300 font-medium mb-2"
              >
                Suchen
              </label>
              <input
                type="text"
                id="search"
                placeholder="Log-Nachricht oder Details suchen..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="level"
                className="block text-gray-300 font-medium mb-2"
              >
                Log-Level
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Level</option>
                <option value="error">Fehler</option>
                <option value="warning">Warnung</option>
                <option value="info">Information</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-gray-300 font-medium mb-2"
              >
                Kategorie
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="all">Alle Kategorien</option>
                <option value="user">Benutzer</option>
                <option value="quiz">Quiz</option>
                <option value="system">System</option>
                <option value="security">Sicherheit</option>
                <option value="performance">Performance</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dateRange"
                className="block text-gray-300 font-medium mb-2"
              >
                Zeitraum
              </label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              >
                <option value="today">Heute</option>
                <option value="week">Letzte Woche</option>
                <option value="month">Letzter Monat</option>
                <option value="all">Alle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-[#FCC822]">
              Log-Einträge ({filteredLogs.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-6 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200"
              >
                <div className="flex items-start space-x-4">
                  {/* Level Icon */}
                  <div className="flex-shrink-0">
                    <img
                      src={getLevelIcon(log.level)}
                      alt={log.level}
                      className="h-6 w-6"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-[#FCC822] bg-opacity-20 text-[#FCC822] rounded-full text-xs font-medium">
                        {log.category.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <h3 className="text-white font-medium text-lg mb-2">
                      {log.message}
                    </h3>

                    {log.details && (
                      <div className="mb-3">
                        <p className="text-gray-300 text-sm bg-gray-700 bg-opacity-50 p-3 rounded-lg font-mono">
                          {log.details}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      {log.userId && <span>User ID: {log.userId}</span>}
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      <span>ID: {log.id}</span>
                    </div>
                  </div>

                  {/* Category Icon */}
                  <div className="flex-shrink-0">
                    <img
                      src={getCategoryIcon(log.category)}
                      alt={log.category}
                      className="h-6 w-6 opacity-60"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center">
              <img
                src="/buttons/Filter.png"
                alt="No logs"
                className="h-16 w-16 mx-auto mb-4 opacity-50"
              />
              <p className="text-gray-400 text-lg">
                Keine Log-Einträge gefunden.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Ändern Sie Ihre Filterkriterien oder erweitern Sie den Zeitraum.
              </p>
            </div>
          )}
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-2 bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300 text-sm">
              Automatische Aktualisierung alle 30 Sekunden
            </span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
