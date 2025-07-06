/**
 * Authentication context for managing user sessions and role switching.
 *
 * Provides centralized authentication state with automatic session validation.
 * Handles role-based access control for admin and player views.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  authService,
  type User as AuthUser,
  type UserProfileUpdate,
} from '../services/auth';
import { setAuthErrorHandler } from '../api/client';
import { useNavigate } from 'react-router';

export type UserRole = 'player' | 'admin';
export type ActiveRole = 'player' | 'admin';

/**
 * User interface for frontend authentication state.
 *
 * Extends backend user data with frontend-specific display fields.
 * Includes role information and UI customization data.
 */
export interface User {
  id: number;
  email: string;
  is_verified: boolean;
  // Additional frontend-specific fields
  username: string; // Required for UI display
  role: UserRole;
  avatar?: string;
  wisecoins: number;
  achievements: string[];
  // Profile fields
  nickname?: string;
  avatar_url?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  activeRole: ActiveRole;
  isViewingAsAdmin: boolean;
  setActiveRole: (role: ActiveRole) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserProfileUpdate) => Promise<void>;
  deleteAccount: () => Promise<void>;
  switchToAdminView: (
    navigate?: (path: string) => void,
    currentPath?: string
  ) => void;
  switchToPlayerView: (
    navigate?: (path: string) => void,
    currentPath?: string
  ) => void;
  loading: boolean;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook for accessing authentication context.
 *
 * Provides type-safe access to auth state and methods.
 * Throws error if used outside AuthProvider scope.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Transform backend user data to frontend format.
 *
 * Converts API response to UI-ready user object.
 * Adds default values for frontend-specific fields.
 */
function transformBackendUser(backendUser: AuthUser): User {
  // Determine role based on actual backend role data
  const userRole: UserRole =
    backendUser.role_name === 'admin' ? 'admin' : 'player';

  return {
    id: backendUser.id,
    email: backendUser.email,
    is_verified: backendUser.is_verified,
    username: backendUser.email.split('@')[0], // Generate username from email
    role: userRole,
    avatar:
      userRole === 'admin'
        ? '/avatars/ai_assistant_wizard.png'
        : '/avatars/player_male_with_greataxe.png',
    wisecoins: 500, // Default value, could be fetched from backend later
    achievements: ['first_quiz', 'quiz_master'], // Default achievements
    nickname: backendUser.nickname,
    avatar_url: backendUser.avatar_url,
    bio: backendUser.bio,
  };
}

/**
 * Custom hook for session validation logic.
 *
 * Encapsulates session checking and cleanup operations.
 * Provides clean separation of session management concerns.
 */
function useSessionValidation(
  setUser: (user: User | null) => void,
  setActiveRole: (role: ActiveRole) => void
) {
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!authService.isAuthenticated()) {
        return false;
      }

      await authService.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      clearUserSession(setUser, setActiveRole);
      redirectToLogin();
      return false;
    }
  }, [setUser, setActiveRole]);

  return { validateSession };
}

/**
 * Clear user session data from state and storage.
 *
 * Removes all authentication artifacts consistently.
 * Ensures clean logout state across the application.
 */
function clearUserSession(
  setUser: (user: User | null) => void,
  setActiveRole: (role: ActiveRole) => void
) {
  setUser(null);
  setActiveRole('player');
  authService.logout();
  sessionStorage.removeItem('quizdom_user');
  sessionStorage.removeItem('quizdom_active_role');
}

/**
 * Redirect user to login page.
 *
 * Handles browser navigation safely.
 * Only executes in browser environment.
 */
function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Custom hook for session monitoring.
 *
 * Manages periodic session validation and activity tracking.
 * Handles automatic logout on session expiration.
 */
function useSessionMonitoring(
  setUser: (user: User | null) => void,
  setActiveRole: (role: ActiveRole) => void
) {
  const sessionCheckInterval = useRef<number | null>(null);
  const lastActivityTime = useRef<number>(Date.now());

  const updateActivity = useCallback(() => {
    lastActivityTime.current = Date.now();
  }, []);

  const validateSessionSafely = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) {
        return;
      }
      await authService.getCurrentUser();
      lastActivityTime.current = Date.now();
    } catch (error) {
      console.error('Session validation failed:', error);
      clearUserSession(setUser, setActiveRole);
      redirectToLogin();
    }
  }, [setUser, setActiveRole]);

  const startSessionMonitoring = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = window.setInterval(
      async () => {
        const timeSinceActivity = Date.now() - lastActivityTime.current;

        if (timeSinceActivity > 30 * 60 * 1000) {
          await validateSessionSafely();
        } else if (timeSinceActivity < 15 * 60 * 1000) {
          await validateSessionSafely();
        }
      },
      5 * 60 * 1000
    );
  }, [validateSessionSafely]);

  const stopSessionMonitoring = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  }, []);

  return {
    updateActivity,
    startSessionMonitoring,
    stopSessionMonitoring,
  };
}

/**
 * Authentication provider component.
 *
 * Manages global authentication state and session lifecycle.
 * Provides context for role-based access control.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>('player');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { validateSession } = useSessionValidation(setUser, setActiveRole);
  const { updateActivity, startSessionMonitoring, stopSessionMonitoring } =
    useSessionMonitoring(setUser, setActiveRole);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authResponse = await authService.login({ email, password });
      const frontendUser = transformBackendUser(authResponse.user);

      setUser(frontendUser);
      sessionStorage.setItem('quizdom_user', JSON.stringify(frontendUser));

      const initialRole: ActiveRole =
        frontendUser.role === 'admin' ? 'admin' : 'player';
      setActiveRole(initialRole);
      sessionStorage.setItem('quizdom_active_role', initialRole);

      startSessionMonitoring();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authResponse = await authService.register({ email, password });
      const frontendUser = transformBackendUser(authResponse.user);

      setUser(frontendUser);
      sessionStorage.setItem('quizdom_user', JSON.stringify(frontendUser));

      const initialRole: ActiveRole =
        frontendUser.role === 'admin' ? 'admin' : 'player';
      setActiveRole(initialRole);
      sessionStorage.setItem('quizdom_active_role', initialRole);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    clearUserSession(setUser, setActiveRole);
    stopSessionMonitoring();
    redirectToLogin();
  }, [stopSessionMonitoring]);

  const updateProfile = useCallback(async (data: UserProfileUpdate) => {
    try {
      const updatedAuthUser = await authService.updateProfile(data);
      const updatedUser = transformBackendUser(updatedAuthUser);
      setUser(updatedUser);

      // Update localStorage to persist the changes
      localStorage.setItem('quizdom_user', JSON.stringify(updatedAuthUser));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      await authService.deleteAccount();
      clearUserSession(setUser, setActiveRole);
      stopSessionMonitoring();

      // Trigger storage event to logout all tabs
      window.localStorage.setItem('quizdom_logout', Date.now().toString());

      // Navigate to goodbye page
      navigate('/goodbye');
    } catch (error) {
      console.error('Account deletion failed:', error);
      throw error;
    }
  }, [stopSessionMonitoring, navigate]);

  const switchToAdminView = (
    navigate?: (path: string) => void,
    currentPath?: string
  ) => {
    if (user?.role === 'admin') {
      setActiveRole('admin');
      sessionStorage.setItem('quizdom_active_role', 'admin');

      if (navigate && currentPath && !currentPath.startsWith('/admin')) {
        navigate('/admin/dashboard');
      }
    }
  };

  const switchToPlayerView = (
    navigate?: (path: string) => void,
    currentPath?: string
  ) => {
    if (user?.role === 'admin') {
      setActiveRole('player');
      sessionStorage.setItem('quizdom_active_role', 'player');

      if (navigate && currentPath && currentPath.startsWith('/admin')) {
        navigate('/');
      }
    }
  };

  // Check for existing session on mount and validate with backend
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a valid token and can get current user
        if (authService.isAuthenticated()) {
          const backendUser = await authService.getCurrentUser();
          const frontendUser = transformBackendUser(backendUser);
          setUser(frontendUser);

          // Restore active role from sessionStorage
          const savedRole = sessionStorage.getItem(
            'quizdom_active_role'
          ) as ActiveRole;
          if (savedRole && frontendUser.role === 'admin') {
            setActiveRole(savedRole);
          } else {
            setActiveRole(frontendUser.role === 'admin' ? 'admin' : 'player');
          }

          startSessionMonitoring();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearUserSession(setUser, setActiveRole);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const handleActivity = () => {
      updateActivity();
    };

    // Add global activity listeners
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Setup global auth error handler
    setAuthErrorHandler(() => {
      clearUserSession(setUser, setActiveRole);
      redirectToLogin();
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      stopSessionMonitoring();
    };
  }, [startSessionMonitoring, stopSessionMonitoring, updateActivity]);

  // Listen for logout events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quizdom_logout' && e.newValue) {
        clearUserSession(setUser, setActiveRole);
        stopSessionMonitoring();
        navigate('/goodbye');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [stopSessionMonitoring, navigate]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    activeRole,
    isViewingAsAdmin: activeRole === 'admin',
    setActiveRole,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    switchToAdminView,
    switchToPlayerView,
    loading,
    validateSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
