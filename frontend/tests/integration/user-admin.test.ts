/**
 * Integration tests for user admin service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiClient } from '../../app/api/client';
import { userAdminService } from '../../app/services/user-admin';

// Mock the API client
vi.mock('../../app/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock auth service for authentication header
vi.mock('../../app/services/auth', () => ({
  authService: {
    getToken: vi.fn(() => 'mock-token'),
    getAuthHeader: vi.fn(() => ({
      Authorization: 'Bearer mock-token'
    })),
  },
}));

describe('UserAdmin Service', () => {
  // Sample data for testing
  const mockUserListResponse = {
    data: [
      {
        id: 1,
        email: 'admin@example.com',
        is_verified: true,
        created_at: '2023-01-01T00:00:00',
        deleted_at: null,
        role_name: 'admin',
        last_login: '2023-01-10T00:00:00',
        quizzes_completed: 5,
        average_score: 90.5,
        total_score: 450,
      },
      {
        id: 2,
        email: 'user@example.com',
        is_verified: true,
        created_at: '2023-01-02T00:00:00',
        deleted_at: null,
        role_name: 'user',
        last_login: null,
        quizzes_completed: 0,
        average_score: 0,
        total_score: 0,
      },
    ],
    total: 2,
    skip: 0,
    limit: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches user list with default parameters', async () => {
    (apiClient.get as any).mockResolvedValueOnce(mockUserListResponse);

    const result = await userAdminService.listUsers();

    // Verify API call
    expect(apiClient.get).toHaveBeenCalledWith('/v1/admin/users', {
      headers: { Authorization: 'Bearer mock-token' },
    });

    // Verify result transformation
    expect(result).toHaveLength(2);
    expect(result[0].email).toBe('admin@example.com');
    expect(result[1].email).toBe('user@example.com');
  });

  it('fetches user list with custom parameters', async () => {
    (apiClient.get as any).mockResolvedValueOnce(mockUserListResponse);

    await userAdminService.listUsers({
      search: 'admin',
      role_filter: 'admin',
      status_filter: 'active',
      skip: 10,
      limit: 50,
    });

    // Verify correct URL with query parameters
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/users?'),
      expect.any(Object)
    );

    const url = (apiClient.get as any).mock.calls[0][0];
    expect(url).toContain('search=admin');
    expect(url).toContain('role_filter=admin');
    expect(url).toContain('status_filter=active');
    expect(url).toContain('skip=10');
    expect(url).toContain('limit=50');
  });

  it('creates a new user', async () => {
    const mockNewUser = {
      id: 3,
      email: 'new@example.com',
      is_verified: true,
    };

    const userData = {
      email: 'new@example.com',
      password: 'password123',
      is_verified: true,
      role_id: 2,
    };

    (apiClient.post as any).mockResolvedValueOnce(mockNewUser);

    const result = await userAdminService.createUser(userData);

    // Verify API call
    expect(apiClient.post).toHaveBeenCalledWith('/v1/admin/users', userData, {
      headers: { Authorization: 'Bearer mock-token' },
    });

    // Verify result
    expect(result).toEqual(mockNewUser);
  });

  it('updates an existing user', async () => {
    const mockUpdatedUser = {
      id: 2,
      email: 'updated@example.com',
      is_verified: false,
    };

    const updateData = {
      email: 'updated@example.com',
      is_verified: false,
    };

    (apiClient.put as any).mockResolvedValueOnce(mockUpdatedUser);

    const result = await userAdminService.updateUser(2, updateData);

    // Verify API call
    expect(apiClient.put).toHaveBeenCalledWith(
      '/v1/admin/users/2',
      updateData,
      { headers: { Authorization: 'Bearer mock-token' } }
    );

    // Verify result
    expect(result).toEqual(mockUpdatedUser);
  });

  it('updates user status', async () => {
    const mockUpdatedUser = {
      id: 2,
      email: 'user@example.com',
      is_verified: true,
      deleted_at: '2023-06-01T00:00:00',
    };

    (apiClient.put as any).mockResolvedValueOnce(mockUpdatedUser);

    const result = await userAdminService.updateUserStatus(2, false);

    // Verify API call - check if correct endpoint is used
    expect(apiClient.put).toHaveBeenCalledWith(
      '/v1/admin/users/2/status',
      { deleted_at: expect.any(String) },
      { headers: { Authorization: 'Bearer mock-token' } }
    );

    // Verify result
    expect(result).toEqual(mockUpdatedUser);
  });

  it('deletes a user', async () => {
    (apiClient.delete as any).mockResolvedValueOnce({ status: 204 });

    await userAdminService.deleteUser(2);

    // Verify API call
    expect(apiClient.delete).toHaveBeenCalledWith('/v1/admin/users/2', {
      headers: { Authorization: 'Bearer mock-token' },
    });
  });

  it('gets user statistics', async () => {
    const mockStats = {
      total_users: 10,
      active_users: 8,
      verified_users: 7,
      admin_users: 2,
      recent_registrations: 3,
      new_users_this_month: 5,
    };

    (apiClient.get as any).mockResolvedValueOnce(mockStats);

    const result = await userAdminService.getUserStats();

    // Verify API call
    expect(apiClient.get).toHaveBeenCalledWith('/v1/admin/users/stats', {
      headers: { Authorization: 'Bearer mock-token' },
    });

    // Verify result
    expect(result).toEqual(mockStats);
  });

  it('gets available roles', async () => {
    const mockRoles = [
      { id: 1, name: 'admin', description: 'Administrator' },
      { id: 2, name: 'user', description: 'Regular User' },
    ];

    (apiClient.get as any).mockResolvedValueOnce(mockRoles);

    const result = await userAdminService.getRoles();

    // Verify API call
    expect(apiClient.get).toHaveBeenCalledWith('/v1/admin/roles', {
      headers: { Authorization: 'Bearer mock-token' },
    });

    // Verify result
    expect(result).toEqual(mockRoles);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('admin');
    expect(result[1].name).toBe('user');
  });

  it('handles API errors gracefully', async () => {
    const error = new Error('API Error');
    (apiClient.get as any).mockRejectedValueOnce(error);

    await expect(userAdminService.listUsers()).rejects.toThrow('API Error');
  });
});
