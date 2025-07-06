import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService, type UserProfileUpdate } from '../../app/services/auth';
import { apiClient } from '../../app/api/client';

// Mock the API client
vi.mock('../../app/api/client', () => ({
  apiClient: {
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      is_verified: true,
      nickname: 'TestUser',
      avatar_url: '/avatars/test.png',
      bio: 'Test bio',
    };

    const mockToken = 'test-token';

    beforeEach(() => {
      sessionStorageMock.getItem.mockReturnValue(mockToken);
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
    });

    it('should update profile successfully', async () => {
      const updateData: UserProfileUpdate = {
        nickname: 'NewNickname',
        avatar_url: '/avatars/new.png',
        bio: 'New bio',
      };

      const updatedUser = { ...mockUser, ...updateData };
      vi.mocked(apiClient.put).mockResolvedValue(updatedUser);

      const result = await authService.updateProfile(updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/v1/auth/me', updateData, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(updatedUser);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quizdom_user',
        JSON.stringify(updatedUser)
      );
    });

    it('should handle profile update errors', async () => {
      const updateData: UserProfileUpdate = {
        nickname: 'ExistingNickname',
      };

      vi.mocked(apiClient.put).mockRejectedValue(new Error('HTTP 409: Conflict'));

      await expect(authService.updateProfile(updateData)).rejects.toThrow();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle network errors during profile update', async () => {
      const updateData: UserProfileUpdate = {
        nickname: 'NewNickname',
      };

      vi.mocked(apiClient.put).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(authService.updateProfile(updateData)).rejects.toThrow(
        'Network error: Could not connect to authentication server'
      );
    });
  });

  describe('deleteAccount', () => {
    const mockToken = 'test-token';

    beforeEach(() => {
      sessionStorageMock.getItem.mockReturnValue(mockToken);
    });

    it('should delete account and logout successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ message: 'Account deleted' });

      await authService.deleteAccount();

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/auth/me', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('quizdom_access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizdom_user');
    });

    it('should handle delete account errors', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('HTTP 401: Unauthorized'));

      await expect(authService.deleteAccount()).rejects.toThrow();
    });

    it('should handle network errors during account deletion', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(authService.deleteAccount()).rejects.toThrow(
        'Network error: Could not connect to authentication server'
      );
    });
  });

  describe('getAuthHeader', () => {
    it('should return authorization header when token exists', () => {
      const mockToken = 'test-token';
      sessionStorageMock.getItem.mockReturnValue(mockToken);

      const headers = authService.getAuthHeader();

      expect(headers).toEqual({ Authorization: `Bearer ${mockToken}` });
    });

    it('should return empty object when no token exists', () => {
      sessionStorageMock.getItem.mockReturnValue(null);

      const headers = authService.getAuthHeader();

      expect(headers).toEqual({});
    });
  });
});
