/**
 * Authentication service for frontend-backend communication.
 *
 * Handles user authentication, session management, and secure API communication.
 * Provides a clean interface for login, registration, and token management.
 */

import { apiClient } from '../api/client';

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
  is_verified: boolean;
  role_id?: number | null;
  role_name?: string | null;
  // Frontend-specific fields for UI functionality
  username?: string;
  role?: 'player' | 'admin';
  wisecoins?: number;
  achievements?: string[];
  // Profile fields
  nickname?: string;
  avatar_url?: string;
  bio?: string;
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

export interface UserProfileUpdate {
  nickname?: string;
  avatar_url?: string;
  bio?: string;
}

/**
 * Enhanced error handler for auth operations.
 *
 * Converts technical errors into user-friendly messages.
 * Provides consistent error handling across all auth operations.
 */
function handleAuthError(error: unknown): never {
  console.error('Auth service error:', error);

  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new Error(
      'Network error: Could not connect to authentication server'
    );
  }

  if (error instanceof Error) {
    const message = error.message;

    if (message.includes('HTTP 400')) {
      throw new Error('Invalid request: Please check your input data');
    } else if (message.includes('HTTP 401')) {
      throw new Error('Authentication failed: Invalid email or password');
    } else if (message.includes('HTTP 422')) {
      throw new Error('Validation error: Please check your input format');
    } else if (message.includes('HTTP 500')) {
      throw new Error('Server error: Please try again later');
    }

    if (!message.includes('HTTP')) {
      throw error;
    }
  }

  throw new Error('Authentication failed: Please try again');
}

/**
 * Authentication service class.
 *
 * Provides centralized authentication management with tab-isolated storage.
 * Handles token lifecycle and user session state.
 *
 * Uses sessionStorage for tokens to ensure proper isolation in multi-user scenarios.
 * Uses localStorage for user data to maintain profile across tabs.
 */
class AuthService {
  private tokenKey = 'quizdom_access_token';
  private userKey = 'quizdom_user';

  /**
   * Register a new user account.
   *
   * Creates a new user and automatically logs them in.
   * Stores authentication data for immediate access.
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/v1/auth/register',
        userData
      );

      this.setToken(response.access_token);
      this.setUser(response.user);

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      handleAuthError(error);
    }
  }

  /**
   * Login with email and password.
   *
   * Authenticates user credentials and stores session data.
   * Uses OAuth2 form format for backend compatibility.
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // WHY: OAuth2 requires form-encoded data with 'username' field
      const formBody = new URLSearchParams();
      formBody.append('username', credentials.email);
      formBody.append('password', credentials.password);

      const response = await apiClient.post<AuthResponse>(
        '/v1/auth/login',
        formBody.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.setToken(response.access_token);
      this.setUser(response.user);

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      handleAuthError(error);
    }
  }

  /**
   * Get current user information from backend.
   *
   * Fetches fresh user data from the server.
   * Clears session if token is invalid or expired.
   */
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const user = await this.makeAuthenticatedRequest<User>('/v1/auth/me');
      this.setUser(user);

      return user;
    } catch (error) {
      console.error('Get current user failed:', error);
      this.logout();
      handleAuthError(error);
    }
  }

  /**
   * Make authenticated API request.
   *
   * Sends API request with Bearer token authentication.
   * Handles token validation and error conversion.
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
      handleAuthError(error);
    }
  }

  /**
   * Logout user and clear stored data.
   *
   * Removes all authentication data from storage.
   * Forces user to re-authenticate on next access.
   */
  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Check if user is authenticated.
   *
   * Validates presence of both token and user data.
   * Used to determine if protected routes should be accessible.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Get stored authentication token.
   *
   * Retrieves JWT token from sessionStorage.
   * Returns null if no token is stored.
   *
   * Uses sessionStorage to ensure proper tab isolation for multi-user scenarios.
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  /**
   * Set authentication token.
   *
   * Stores JWT token in sessionStorage for tab-isolated persistence.
   * Used internally after successful authentication.
   *
   * Uses sessionStorage to prevent token sharing between browser tabs.
   */
  private setToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get stored user data.
   *
   * Retrieves and parses user data from localStorage.
   * Cleans up invalid JSON and returns null if not found.
   *
   * Note: User data remains in localStorage for profile consistency,
   * but authentication is validated through the tab-isolated token.
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  /**
   * Set user data.
   *
   * Stores user information in localStorage as JSON.
   * Used internally after successful authentication.
   */
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Get authorization header for API requests.
   *
   * Returns Bearer token header or empty object.
   * Used for manual API calls outside the service.
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Update user profile information.
   *
   * Updates nickname, avatar_url, and bio fields.
   * Automatically updates stored user data on success.
   */
  async updateProfile(data: UserProfileUpdate): Promise<User> {
    try {
      const response = await apiClient.put<User>('/v1/auth/me', data, {
        headers: this.getAuthHeader(),
      });

      // Update stored user data with new profile information
      const currentUser = this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response };
        this.setUser(updatedUser);
      }

      return response;
    } catch (error) {
      console.error('Profile update failed:', error);
      handleAuthError(error);
    }
  }

  /**
   * Delete user account.
   *
   * Soft-deletes the user account on the backend.
   * Automatically logs out the user after successful deletion.
   */
  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/v1/auth/me', {
        headers: this.getAuthHeader(),
      });

      // Clear all authentication data after successful deletion
      this.logout();
    } catch (error) {
      console.error('Account deletion failed:', error);
      handleAuthError(error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
