import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth, type User } from '../../app/contexts/auth';
import { authService } from '../../app/services/auth';

// Mock the auth service
vi.mock('../../app/services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mocks to return null by default
    localStorageMock.getItem.mockReturnValue(null);

    // Set up default auth service mocks
    (authService.login as any).mockResolvedValue({
      access_token: 'mock-token',
      token_type: 'bearer',
      user: {
        id: 1,
        email: 'user@example.com',
        is_verified: true,
      },
    });

    (authService.register as any).mockResolvedValue({
      access_token: 'mock-token',
      token_type: 'bearer',
      user: {
        id: 1,
        email: 'user@example.com',
        is_verified: true,
      },
    });

    (authService.isAuthenticated as any).mockReturnValue(false);
    (authService.getCurrentUser as any).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      is_verified: true,
    });
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('provides initial auth state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.activeRole).toBe('player');
      expect(result.current.isViewingAsAdmin).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('login functionality', () => {
    it('successfully logs in a regular user', async () => {
      // Mock login response for regular user
      (authService.login as any).mockResolvedValue({
        access_token: 'mock-token',
        token_type: 'bearer',
        user: {
          id: 1,
          email: 'user@example.com',
          is_verified: true,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.login('user@example.com', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('user@example.com');
      expect(result.current.user?.username).toBe('user');
      expect(result.current.user?.role).toBe('player');
      expect(result.current.activeRole).toBe('player');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quizdom_user',
        expect.stringContaining('"email":"user@example.com"')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quizdom_active_role',
        'player'
      );
    });

    it('successfully logs in an admin user', async () => {
      // Mock login response for admin user
      (authService.login as any).mockResolvedValue({
        access_token: 'mock-token',
        token_type: 'bearer',
        user: {
          id: 2,
          email: 'admin@example.com',
          is_verified: true,
          role_name: 'admin',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.login('admin@example.com', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('admin@example.com');
      expect(result.current.user?.username).toBe('admin');
      expect(result.current.user?.role).toBe('admin');
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.activeRole).toBe('admin');
    });

    it('handles loading state properly during login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Login should complete successfully regardless of loading state timing
      await act(async () => {
        await result.current.login('user@example.com', 'password');
      });

      // After login, loading should be false and user should be authenticated
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout functionality', () => {
    it('successfully logs out user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // First login
      await act(async () => {
        await result.current.login('user@example.com', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.activeRole).toBe('player');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizdom_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'quizdom_active_role'
      );
    });
  });

  describe('role switching functionality', () => {
    it('allows admin to switch to admin view', async () => {
      // Mock login response for admin user
      (authService.login as any).mockResolvedValue({
        access_token: 'mock-token',
        token_type: 'bearer',
        user: {
          id: 2,
          email: 'admin@example.com',
          is_verified: true,
          role_name: 'admin',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      const mockNavigate = vi.fn();

      // Wait for initial state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Login as admin
      await act(async () => {
        await result.current.login('admin@example.com', 'password');
      });

      // Verify admin state is set up correctly
      expect(result.current.user?.role).toBe('admin');
      expect(result.current.isAdmin).toBe(true);

      // Switch to admin view
      act(() => {
        result.current.switchToAdminView(mockNavigate, '/');
      });

      expect(result.current.activeRole).toBe('admin');
      expect(result.current.isViewingAsAdmin).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quizdom_active_role',
        'admin'
      );
    });

    it('allows admin to switch to player view', async () => {
      // Mock login response for admin user
      (authService.login as any).mockResolvedValue({
        access_token: 'mock-token',
        token_type: 'bearer',
        user: {
          id: 2,
          email: 'admin@example.com',
          is_verified: true,
          role_name: 'admin',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      const mockNavigate = vi.fn();

      // Wait for initial state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Login as admin
      await act(async () => {
        await result.current.login('admin@example.com', 'password');
      });

      // Verify admin state is set up correctly
      expect(result.current.user?.role).toBe('admin');
      expect(result.current.isAdmin).toBe(true);

      // Switch to player view
      act(() => {
        result.current.switchToPlayerView(mockNavigate, '/admin/dashboard');
      });

      expect(result.current.activeRole).toBe('player');
      expect(result.current.isViewingAsAdmin).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quizdom_active_role',
        'player'
      );
    });

    it('does not allow regular user to switch to admin view', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Login as regular user
      await act(async () => {
        await result.current.login('user@example.com', 'password');
      });

      // Try to switch to admin view
      act(() => {
        result.current.switchToAdminView();
      });

      expect(result.current.activeRole).toBe('player');
      expect(result.current.isViewingAsAdmin).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('restores user from localStorage on initialization', async () => {
      const mockUser: User = {
        id: 1,
        email: 'user@example.com',
        username: 'user',
        role: 'player',
        wisecoins: 500,
        achievements: ['first_quiz', 'quiz_master'],
        is_verified: true,
        avatar: '/avatars/player_male_with_greataxe.png',
      };

      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'quizdom_user') return JSON.stringify(mockUser);
        if (key === 'quizdom_active_role') return 'player';
        return null;
      });

      // Mock that user is authenticated
      (authService.isAuthenticated as any).mockReturnValue(true);
      (authService.getCurrentUser as any).mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        is_verified: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.activeRole).toBe('player');
    });

    it('handles invalid localStorage data gracefully', async () => {
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'quizdom_user') return 'invalid-json';
        return null;
      });

      // Mock that user is authenticated but getCurrentUser will fail
      (authService.isAuthenticated as any).mockReturnValue(true);
      (authService.getCurrentUser as any).mockRejectedValue(
        new Error('Invalid token')
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      // The auth context should clear localStorage when initialization fails
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizdom_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'quizdom_active_role'
      );
    });
  });
});
