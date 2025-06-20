import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

export type UserRole = 'player' | 'admin';
export type ActiveRole = 'player' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<ActiveRole>('player');

  // Mock authentication - replace with real API calls
  const login = async (email: string, _password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data based on email for demo
      const mockUser: User = {
        id: '1',
        email,
        username: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'player',
        avatar: email.includes('admin')
          ? '/avatars/ai_assistant_wizard.png'
          : '/avatars/player_male_with_greataxe.png',
        wisecoins: 500,
        achievements: ['first_quiz', 'quiz_master'],
      };

      setUser(mockUser);
      localStorage.setItem('quizdom_user', JSON.stringify(mockUser));

      // Set initial active role: admin users start in admin view, players in player view
      const initialRole: ActiveRole =
        mockUser.role === 'admin' ? 'admin' : 'player';
      setActiveRole(initialRole);
      localStorage.setItem('quizdom_active_role', initialRole);
    } catch (error) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Login failed:', error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveRole('player');
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

      // If navigation function is provided and we're not on an admin route, navigate to admin dashboard
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

      // If navigation function is provided and we're on an admin route, navigate to home
      if (navigate && currentPath && currentPath.startsWith('/admin')) {
        navigate('/');
      }
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('quizdom_user');
    const savedActiveRole = localStorage.getItem(
      'quizdom_active_role'
    ) as ActiveRole;

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Set active role from localStorage, or default based on user role
        if (
          savedActiveRole &&
          (savedActiveRole === 'admin' || savedActiveRole === 'player')
        ) {
          setActiveRole(savedActiveRole);
        } else {
          const defaultRole: ActiveRole =
            parsedUser.role === 'admin' ? 'admin' : 'player';
          setActiveRole(defaultRole);
          localStorage.setItem('quizdom_active_role', defaultRole);
        }
      } catch (error) {
        // Log error in development only
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to parse saved user:', error);
        }
        localStorage.removeItem('quizdom_user');
        localStorage.removeItem('quizdom_active_role');
      }
    }
    setLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    activeRole,
    isViewingAsAdmin: activeRole === 'admin' && user?.role === 'admin',
    login,
    logout,
    switchToAdminView,
    switchToPlayerView,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
