import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'player' | 'admin';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  // Mock authentication - replace with real API calls
  const login = async (email: string, password: string) => {
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
        avatar: email.includes('admin') ? '/avatars/ai_assistant_wizard.png' : '/avatars/player_male_with_greataxe.png',
        wisecoins: 500,
        achievements: ['first_quiz', 'quiz_master']
      };

      setUser(mockUser);
      localStorage.setItem('quizdom_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quizdom_user');
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('quizdom_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('quizdom_user');
      }
    }
    setLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 