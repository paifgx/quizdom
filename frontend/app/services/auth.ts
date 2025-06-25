/**
 * Authentication service for frontend-backend communication.
 * Handles login, registration, and user session management.
 */

import { apiClient } from '../api/client';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  nickname?: string;
  is_verified: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthError {
  detail: string;
  code?: string;
  field?: string;
}

/**
 * Authentication service class.
 */
class AuthService {
  private tokenKey = 'quizdom_access_token';
  private userKey = 'quizdom_user';

  /**
   * Register a new user account.
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        userData
      );

      // Store token and user data
      this.setToken(response.access_token);
      this.setUser(response.user);

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login with email and password.
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login-json',
        credentials
      );

      // Store token and user data
      this.setToken(response.access_token);
      this.setUser(response.user);

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Get current user information from backend.
   */
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use the authenticated API client
      const user = await this.makeAuthenticatedRequest<User>('/auth/me');
      this.setUser(user);

      return user;
    } catch (error) {
      console.error('Get current user failed:', error);
      this.logout(); // Clear invalid token
      throw error;
    }
  }

  /**
   * Make authenticated API request.
   */
  private async makeAuthenticatedRequest<T>(endpoint: string): Promise<T> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await apiClient.get<T>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      console.error(`Request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Logout user and clear stored data.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Get stored authentication token.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set authentication token.
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get stored user data.
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      // Invalid JSON, remove it
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  /**
   * Set user data.
   */
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Get authorization header for API requests.
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
