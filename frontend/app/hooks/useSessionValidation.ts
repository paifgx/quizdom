import { useCallback } from 'react';
import { useAuth } from '../contexts/auth';

/**
 * Custom hook for session validation in components.
 *
 * Provides methods to validate session and automatically handle
 * session expiration with user-friendly feedback.
 */
export function useSessionValidation() {
  const { validateSession, isAuthenticated, logout } = useAuth();

  /**
   * Validate session and handle errors gracefully.
   *
   * Returns true if session is valid, false if expired.
   * Automatically redirects to login on expiration.
   */
  const checkSession = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const isValid = await validateSession();
      if (!isValid) {
        console.log('Session expired, redirecting to login...');
        logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      logout();
      return false;
    }
  }, [validateSession, isAuthenticated, logout]);

  /**
   * Validate session when component mounts (optional).
   *
   * Useful for pages that require fresh session validation.
   */
  const validateOnMount = useCallback(() => {
    if (isAuthenticated) {
      checkSession();
    }
  }, [checkSession, isAuthenticated]);

  return {
    checkSession,
    validateOnMount,
    isAuthenticated,
  };
}
