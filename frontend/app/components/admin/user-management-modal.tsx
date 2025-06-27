/**
 * User management modal for creating and editing users.
 *
 * Provides a form interface for admin users to create new users or edit existing ones,
 * including setting roles and verification status.
 */

import React, { useState, useEffect } from 'react';
import type {
  UserAdminData,
  CreateUserRequest,
  UpdateUserRequest,
  Role,
} from '../../services/user-admin';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  user?: UserAdminData | null;
  roles: Role[];
  isLoading?: boolean;
}

export function UserManagementModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles,
  isLoading = false,
}: UserManagementModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role_id: '',
    is_verified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!user;

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Edit mode - populate with user data
        setFormData({
          email: user.email,
          password: '',
          role_id: user.role_name
            ? roles.find(r => r.name === user.role_name)?.id.toString() || ''
            : '',
          is_verified: user.is_verified,
        });
      } else {
        // Create mode - reset form
        setFormData({
          email: '',
          password: '',
          role_id: '',
          is_verified: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, user, roles]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültiges E-Mail-Format';
    }

    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        // Edit mode - only send changed fields
        const updateData: UpdateUserRequest = {};

        if (formData.email !== user!.email) {
          updateData.email = formData.email;
        }

        if (formData.is_verified !== user!.is_verified) {
          updateData.is_verified = formData.is_verified;
        }

        const currentRoleId = user!.role_name
          ? roles.find(r => r.name === user!.role_name)?.id
          : null;
        const newRoleId = formData.role_id ? parseInt(formData.role_id) : null;

        if (currentRoleId !== newRoleId) {
          updateData.role_id = newRoleId || undefined;
        }

        await onSubmit(updateData);
      } else {
        // Create mode - send all required fields
        const createData: CreateUserRequest = {
          email: formData.email,
          password: formData.password,
          is_verified: formData.is_verified,
        };

        if (formData.role_id) {
          createData.role_id = parseInt(formData.role_id);
        }

        await onSubmit(createData);
      }

      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        submit:
          error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#FCC822]">
            {isEditMode ? 'Benutzer bearbeiten' : 'Neuen Benutzer anlegen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCC822] ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="benutzer@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field (only for create mode or if admin wants to change password) */}
          {!isEditMode && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCC822] ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Mindestens 6 Zeichen"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Rolle
            </label>
            <select
              id="role"
              value={formData.role_id}
              onChange={e => handleInputChange('role_id', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822]"
              disabled={isLoading}
            >
              <option value="">Rolle auswählen</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name === 'admin'
                    ? 'Administrator'
                    : role.name === 'user'
                      ? 'Spieler'
                      : role.name}
                  {role.description && ` - ${role.description}`}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div className="flex items-center space-x-3">
            <input
              id="is_verified"
              type="checkbox"
              checked={formData.is_verified}
              onChange={e => handleInputChange('is_verified', e.target.checked)}
              className="w-4 h-4 text-[#FCC822] bg-gray-700 border-gray-600 rounded focus:ring-[#FCC822] focus:ring-2"
              disabled={isLoading}
            />
            <label htmlFor="is_verified" className="text-sm text-gray-300">
              E-Mail-Adresse ist verifiziert
            </label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-3">
              <p className="text-red-300 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 btn-gradient px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isLoading}
            >
              {isLoading
                ? 'Wird gespeichert...'
                : isEditMode
                  ? 'Speichern'
                  : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
