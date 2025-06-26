/**
 * User administration service for managing users via API.
 *
 * Provides methods for admin users to perform CRUD operations on user accounts,
 * manage user roles, and retrieve user statistics.
 */

import { apiClient } from '../api/client';
import { authService } from './auth';

export interface UserAdminData {
  id: number;
  email: string;
  is_verified: boolean;
  created_at: string;
  deleted_at: string | null;
  role_name: string | null;
  last_login: string | null;
  quizzes_completed: number;
  average_score: number;
  total_score: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  verified_users: number;
  new_users_this_month: number;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role_id?: number;
  is_verified?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  is_verified?: boolean;
  role_id?: number;
}

export interface UserListParams {
  skip?: number;
  limit?: number;
  search?: string;
  role_filter?: string;
  status_filter?: string;
}

class UserAdminService {
  private getAuthHeaders(): Record<string, string> {
    return authService.getAuthHeader();
  }

  /**
   * Get user statistics for admin dashboard
   */
  async getUserStats(): Promise<UserStats> {
    return apiClient.get<UserStats>('/admin/users/stats', {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * List users with optional filtering and pagination
   */
  async listUsers(params: UserListParams = {}): Promise<UserAdminData[]> {
    const searchParams = new URLSearchParams();

    if (params.skip !== undefined)
      searchParams.set('skip', params.skip.toString());
    if (params.limit !== undefined)
      searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.role_filter) searchParams.set('role_filter', params.role_filter);
    if (params.status_filter)
      searchParams.set('status_filter', params.status_filter);

    const url = `/admin/users${searchParams.toString() ? `?${searchParams}` : ''}`;

    return apiClient.get<UserAdminData[]>(url, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Get a specific user by ID
   */
  async getUser(userId: number): Promise<UserAdminData> {
    return apiClient.get<UserAdminData>(`/admin/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<UserAdminData> {
    return apiClient.post<UserAdminData>('/admin/users', userData, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Update an existing user
   */
  async updateUser(
    userId: number,
    userData: UpdateUserRequest
  ): Promise<UserAdminData> {
    return apiClient.put<UserAdminData>(`/admin/users/${userId}`, userData, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(
    userId: number,
    isActive: boolean
  ): Promise<UserAdminData> {
    return apiClient.put<UserAdminData>(
      `/admin/users/${userId}/status`,
      {
        deleted_at: isActive ? null : new Date().toISOString(),
      },
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Permanently delete a user
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/admin/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Get all available roles
   */
  async getRoles(): Promise<Role[]> {
    return apiClient.get<Role[]>('/admin/roles', {
      headers: this.getAuthHeaders(),
    });
  }
}

export const userAdminService = new UserAdminService();
