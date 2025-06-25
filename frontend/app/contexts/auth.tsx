import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { authService, type User as AuthUser } from '../services/auth';

export type UserRole = 'player' | 'admin';
export type ActiveRole = 'player' | 'admin';

// Updated User interface to match backend response
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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  activeRole: ActiveRole;
  isViewingAsAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchToAdminView: (
    navigate?: (path: string) => void,
    currentPath?: string
  ) => void;
  switchToPlayerView: (
    navigate?: (path: string) => void,
    currentPath?: string
  ) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

// Convert backend user to frontend user format
function transformBackendUser(backendUser: AuthUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    is_verified: backendUser.is_verified,
    username: backendUser.email.split('@')[0], // Generate username from email
    // Determine role based on email (temporary logic)
    role: backendUser.email.includes('admin') ? 'admin' : 'player',
    avatar: backendUser.email.includes('admin')
      ? '/avatars/ai_assistant_wizard.png'
      : '/avatars/player_male_with_greataxe.png',
    wisecoins: 500, // Default value, could be fetched from backend later
    achievements: ['first_quiz', 'quiz_master'], // Default achievements
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<ActiveRole>('player');

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authResponse = await authService.login({ email, password });
      const frontendUser = transformBackendUser(authResponse.user);

      setUser(frontendUser);
      localStorage.setItem('quizdom_user', JSON.stringify(frontendUser));

      const initialRole: ActiveRole =
        frontendUser.role === 'admin' ? 'admin' : 'player';
      setActiveRole(initialRole);
      localStorage.setItem('quizdom_active_role', initialRole);
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
      localStorage.setItem('quizdom_user', JSON.stringify(frontendUser));

      const initialRole: ActiveRole =
        frontendUser.role === 'admin' ? 'admin' : 'player';
      setActiveRole(initialRole);
      localStorage.setItem('quizdom_active_role', initialRole);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveRole('player');
    authService.logout(); // Clear auth service data
    localStorage.removeItem('quizdom_user');
    localStorage.removeItem('quizdom_active_role');
  };

  const switchToAdminView = (
    navigate?: (path: string) => void,
    currentPath?: string
  ) => {
    if (user?.role === 'admin') {
      setActiveRole('admin');
      localStorage.setItem('quizdom_active_role', 'admin');

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
      localStorage.setItem('quizdom_active_role', 'player');

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

          // Restore active role from localStorage
          const savedActiveRole = localStorage.getItem(
            'quizdom_active_role'
          ) as ActiveRole;

          if (
            savedActiveRole &&
            (savedActiveRole === 'admin' || savedActiveRole === 'player')
          ) {
            setActiveRole(savedActiveRole);
          } else {
            const defaultRole: ActiveRole =
              frontendUser.role === 'admin' ? 'admin' : 'player';
            setActiveRole(defaultRole);
            localStorage.setItem('quizdom_active_role', defaultRole);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid session
        authService.logout();
        localStorage.removeItem('quizdom_user');
        localStorage.removeItem('quizdom_active_role');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    activeRole,
    isViewingAsAdmin: activeRole === 'admin' && user?.role === 'admin',
    login,
    register,
    logout,
    switchToAdminView,
    switchToPlayerView,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
