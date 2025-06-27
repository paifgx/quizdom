/**
 * Authentication UI state management context.
 *
 * Manages form states and UI interactions for authentication flows.
 * Provides centralized state for login, registration, and form validation.
 */
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

/**
 * Hook for accessing authentication UI context.
 *
 * Provides type-safe access to auth UI state and methods.
 * Throws error if used outside AuthUIProvider scope.
 */
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

/**
 * Authentication UI provider component.
 *
 * Manages UI state for authentication forms and modals.
 * Provides context for form toggling and state management.
 */
export function AuthUIProvider({ children }: AuthUIProviderProps) {
  const [isSignupMode, setInternalSignupMode] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  /**
   * Set signup mode with animation and persistence.
   *
   * Manages mode transitions with proper animation timing.
   * Persists user preference across navigation events.
   */
  const setSignupMode = (isSignup: boolean) => {
    // Only animate if mode is actually changing
    const willAnimate = isSignup !== isSignupMode;
    setShouldAnimate(willAnimate);
    setInternalSignupMode(isSignup);

    // Store the current mode in sessionStorage for persistence during navigation
    sessionStorage.setItem('auth-ui-mode', isSignup ? 'signup' : 'login');
  };

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const savedMode = sessionStorage.getItem('auth-ui-mode');
    if (savedMode) {
      setInternalSignupMode(savedMode === 'signup');
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
