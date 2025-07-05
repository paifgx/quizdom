import { useAuth } from '../contexts/auth';
import type { UserProfileUpdate } from '../services/auth';

/**
 * Custom hook for profile management.
 *
 * Provides simplified access to user profile data and update functions.
 * Acts as syntactic sugar over the auth context.
 */
export function useProfile() {
  const { user, updateProfile, deleteAccount } = useAuth();

  return {
    user,
    updateProfile,
    deleteAccount,
  };
}

// Re-export the type for convenience
export type { UserProfileUpdate };
