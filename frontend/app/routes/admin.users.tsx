import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import { UserManagementModal } from '../components/admin/user-management-modal';
import {
  userAdminService,
  type UserAdminData,
  type UserStats,
  type Role,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '../services/user-admin';
import { useSessionValidation } from '../hooks/useSessionValidation';

export function meta() {
  return [
    { title: 'Benutzer verwalten | Quizdom Admin' },
    {
      name: 'description',
      content: 'Verwalten Sie Benutzerkonten und Berechtigungen.',
    },
  ];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdminData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session validation hook
  const { validateOnMount } = useSessionValidation();

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdminData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const usersData = await userAdminService.listUsers({
        search: searchTerm || undefined,
        role_filter: selectedRole !== 'all' ? selectedRole : undefined,
        status_filter: selectedStatus !== 'all' ? selectedStatus : undefined,
        limit: 100,
      });
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(
        err instanceof Error ? err.message : 'Fehler beim Laden der Benutzer'
      );
    }
  }, [searchTerm, selectedRole, selectedStatus]);

  // Load initial data and validate session
  useEffect(() => {
    validateOnMount(); // Validate session when component mounts
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load data when filters change
  useEffect(() => {
    if (!loading) {
      loadUsers();
    }
  }, [searchTerm, selectedRole, selectedStatus, loadUsers, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [usersData, statsData, rolesData] = await Promise.all([
        userAdminService.listUsers({
          search: searchTerm || undefined,
          role_filter: selectedRole !== 'all' ? selectedRole : undefined,
          status_filter: selectedStatus !== 'all' ? selectedStatus : undefined,
          limit: 100,
        }),
        userAdminService.getUserStats(),
        userAdminService.getRoles(),
      ]);

      setUsers(usersData);
      setStats(statsData);
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(
        err instanceof Error ? err.message : 'Fehler beim Laden der Daten'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    setModalLoading(true);
    try {
      await userAdminService.createUser(userData);
      await loadData(); // Reload all data to update stats
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to create user:', err);
      throw err; // Re-throw to show error in modal
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateUser = async (userData: UpdateUserRequest) => {
    if (!selectedUser) return;

    setModalLoading(true);
    try {
      await userAdminService.updateUser(selectedUser.id, userData);
      await loadData(); // Reload all data
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err; // Re-throw to show error in modal
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: UserAdminData) => {
    try {
      const isActive = !user.deleted_at;
      await userAdminService.updateUserStatus(user.id, !isActive);
      await loadData(); // Reload data
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Fehler beim Ändern des Benutzerstatus'
      );
    }
  };

  const handleDeleteUser = async (user: UserAdminData) => {
    if (
      !window.confirm(
        `Möchten Sie den Benutzer "${user.email}" wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
      )
    ) {
      return;
    }

    try {
      await userAdminService.deleteUser(user.id);
      await loadData(); // Reload data
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(
        err instanceof Error ? err.message : 'Fehler beim Löschen des Benutzers'
      );
    }
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserAdminData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getStatusColor = (user: UserAdminData) => {
    if (user.deleted_at) {
      return 'bg-red-600 text-red-100';
    }
    return 'bg-green-600 text-green-100';
  };

  const getStatusLabel = (user: UserAdminData) => {
    if (user.deleted_at) {
      return 'Inaktiv';
    }
    return 'Aktiv';
  };

  const getRoleLabel = (roleName: string | null) => {
    if (!roleName) return 'Keine Rolle';
    switch (roleName) {
      case 'admin':
        return 'Administrator';
      case 'user':
        return 'Spieler';
      default:
        return roleName;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const daysSinceLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return null;
    const days = Math.floor(
      (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-[#FCC822] text-lg">Lade Benutzerdaten...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 btn-gradient px-4 py-2 rounded-lg font-medium"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
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
            <button
              onClick={openCreateModal}
              className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              <img
                src="/buttons/Add.png"
                alt="Add"
                className="inline h-5 w-5 mr-2"
              />
              Neuen Benutzer anlegen
            </button>
            <button
              onClick={() =>
                window.open(
                  `data:text/csv;charset=utf-8,${encodeURIComponent('CSV Export noch nicht implementiert')}`,
                  '_blank'
                )
              }
              className="bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#FCC822]">
                  {stats.total_users}
                </p>
                <p className="text-gray-300 text-sm">Gesamt Benutzer</p>
              </div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {stats.active_users}
                </p>
                <p className="text-gray-300 text-sm">Aktive Benutzer</p>
              </div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {stats.admin_users}
                </p>
                <p className="text-gray-300 text-sm">Administratoren</p>
              </div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {stats.verified_users}
                </p>
                <p className="text-gray-300 text-sm">Verifiziert</p>
              </div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400">
                  {stats.new_users_this_month}
                </p>
                <p className="text-gray-300 text-sm">Neu diesen Monat</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Suchen
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="E-Mail-Adresse..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCC822]"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rolle
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822]"
              >
                <option value="all">Alle Rollen</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {getRoleLabel(role.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822]"
              >
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="verified">Verifiziert</option>
                <option value="unverified">Nicht verifiziert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 bg-opacity-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Quizzes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Durchschnitt
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Letzter Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.email.split('@')[0]}
                          </p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          {user.is_verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-200">
                              Verifiziert
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role_name === 'admin'
                            ? 'bg-purple-600 bg-opacity-20 text-purple-300'
                            : 'bg-blue-600 bg-opacity-20 text-blue-300'
                        }`}
                      >
                        {getRoleLabel(user.role_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user)}`}
                      >
                        {getStatusLabel(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">
                        {user.quizzes_completed}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">
                        {user.average_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm">
                          {formatDate(user.last_login)}
                        </p>
                        {user.last_login && (
                          <p className="text-gray-400 text-xs">
                            vor {daysSinceLastLogin(user.last_login)} Tagen
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 hover:bg-blue-600 hover:bg-opacity-20 rounded transition-colors"
                          title="Bearbeiten"
                        >
                          <img
                            src="/buttons/Settings.png"
                            alt="Bearbeiten"
                            className="h-5 w-5"
                          />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`p-1 rounded transition-colors ${
                            user.deleted_at
                              ? 'hover:bg-green-600 hover:bg-opacity-20'
                              : 'hover:bg-yellow-600 hover:bg-opacity-20'
                          }`}
                          title={
                            user.deleted_at ? 'Aktivieren' : 'Deaktivieren'
                          }
                        >
                          <img
                            src={
                              user.deleted_at
                                ? '/buttons/Accept.png'
                                : '/buttons/Warning.png'
                            }
                            alt={
                              user.deleted_at ? 'Aktivieren' : 'Deaktivieren'
                            }
                            className="h-5 w-5"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1 hover:bg-red-600 hover:bg-opacity-20 rounded transition-colors"
                          title="Löschen"
                        >
                          <img
                            src="/buttons/Delete.png"
                            alt="Löschen"
                            className="h-5 w-5"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Keine Benutzer gefunden.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={async data => {
          if (selectedUser) {
            await handleUpdateUser(data as UpdateUserRequest);
          } else {
            await handleCreateUser(data as CreateUserRequest);
          }
        }}
        user={selectedUser}
        roles={roles}
        isLoading={modalLoading}
      />
    </ProtectedRoute>
  );
}
