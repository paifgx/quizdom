import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface AuthUIContextType {
  isSignupMode: boolean;
  setSignupMode: (isSignup: boolean) => void;
  shouldAnimate: boolean;
  setShouldAnimate: (animate: boolean) => void;
}

const AuthUIContext = createContext<AuthUIContextType | undefined>(undefined);

export function useAuthUI() {
  const context = useContext(AuthUIContext);
  if (context === undefined) {
    throw new Error('useAuthUI must be used within an AuthUIProvider');
  }
  return context;
}

interface AuthUIProviderProps {
  children: ReactNode;
}

export function AuthUIProvider({ children }: AuthUIProviderProps) {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const setSignupMode = (isSignup: boolean) => {
    // Only animate if mode is actually changing
    const willAnimate = isSignup !== isSignupMode;
    setShouldAnimate(willAnimate);
    setIsSignupMode(isSignup);

    // Store the current mode in sessionStorage for persistence during navigation
    sessionStorage.setItem('auth-ui-mode', isSignup ? 'signup' : 'login');
  };

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const savedMode = sessionStorage.getItem('auth-ui-mode');
    if (savedMode) {
      setIsSignupMode(savedMode === 'signup');
    }
  }, []);

  const value: AuthUIContextType = {
    isSignupMode,
    setSignupMode,
    shouldAnimate,
    setShouldAnimate,
  };

  return (
    <AuthUIContext.Provider value={value}>{children}</AuthUIContext.Provider>
  );
}
