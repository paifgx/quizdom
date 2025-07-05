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

// Response type for user list endpoint
export interface UserListResponse {
  data: UserAdminData[];
  total: number;
  skip: number;
  limit: number;
}

// Response type for roles list endpoint
export interface Role {
  id: number;
  name: string;
  description: string;
}

// Response type for user statistics
export interface UserStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  admin_users: number;
  recent_registrations: number;
  new_users_this_month: number;
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
  /**
   * Get authentication headers for API requests
   */
  private getAuthHeaders() {
    return authService.getAuthHeader();
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

    const url = `/v1/admin/users${searchParams.toString() ? `?${searchParams}` : ''}`;

    const response = await apiClient.get<UserListResponse>(url, {
      headers: this.getAuthHeaders(),
    });

    return response.data;
  }

  /**
   * Get a specific user by ID
   */
  async getUser(userId: number): Promise<UserAdminData> {
    const response = await apiClient.get<UserAdminData>(`/v1/admin/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<UserAdminData> {
    const response = await apiClient.post<UserAdminData>('/v1/admin/users', userData, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  /**
   * Update an existing user
   */
  async updateUser(
    userId: number,
    userData: UpdateUserRequest
  ): Promise<UserAdminData> {
    const response = await apiClient.put<UserAdminData>(`/v1/admin/users/${userId}`, userData, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(
    userId: number,
    isActive: boolean
  ): Promise<UserAdminData> {
    const response = await apiClient.put<UserAdminData>(
      `/v1/admin/users/${userId}/status`,
      {
        deleted_at: isActive ? null : new Date().toISOString(),
      },
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  /**
   * Permanently delete a user
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/v1/admin/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>('/v1/admin/users/stats', {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  /**
   * Get available user roles
   */
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/v1/admin/roles', {
      headers: this.getAuthHeaders(),
    });
    return response;
  }
}

export const userAdminService = new UserAdminService();
