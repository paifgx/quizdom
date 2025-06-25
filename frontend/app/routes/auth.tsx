import React, { useState, useCallback, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/auth';
import { useAuthUI } from '../contexts/auth-ui';
import { useAuthForm } from '../hooks/useAuthForm';
import { SlidingAuthContainer, LoadingSkeleton } from '../components';

/**
 * Meta function for authentication page.
 *
 * Provides SEO metadata for the authentication routes.
 * Used by React Router for document head management.
 */
export function meta() {
  return [
    { title: 'Authentifizierung | Quizdom' },
    {
      name: 'description',
      content: 'Melden Sie sich an oder erstellen Sie Ihr Quizdom-Konto.',
    },
  ];
}

/**
 * Authentication page component with sliding login/signup panels.
 *
 * Handles both login and signup flows with smooth transitions.
 * Manages form state, error handling, and success feedback.
 */
export default function AuthPage() {
  const { login, register, isAuthenticated, user } = useAuth();
  const { isSignupMode, setSignupMode } = useAuthUI();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { formState, handleFieldChange, isFormValid, resetForm, getError } =
    useAuthForm(isSignupMode);

  const handleAuthError = useCallback((isSignup: boolean, error: unknown) => {
    let errorMessage = isSignup
      ? 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
      : 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';

    // WHY: Extract specific error messages for better user experience
    if (error instanceof Error) {
      if (error.message.includes('400')) {
        errorMessage = isSignup
          ? 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.'
          : 'Ungültige E-Mail-Adresse oder Passwort.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Ungültige E-Mail-Adresse oder Passwort.';
      }
    }

    setError(errorMessage);
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      await login(formState.email, formState.password);
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [formState.email, formState.password, login]);

  const handleSignup = useCallback(async () => {
    try {
      await register(formState.email, formState.password);
      console.log('Registration successful');
      setShowSuccess(true);

      // WHY: Auto-hide success message after showing feedback
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, [formState.email, formState.password, register]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        if (isSignupMode) {
          await handleSignup();
        } else {
          await handleLogin();
        }
      } catch (error) {
        handleAuthError(isSignupMode, error);
      } finally {
        setLoading(false);
      }
    },
    [isSignupMode, handleLogin, handleSignup, handleAuthError]
  );

  const resetAuthState = useCallback(() => {
    setError('');
    setShowSuccess(false);
  }, []);

  // WHY: Sync component state with URL changes
  useEffect(() => {
    setSignupMode(location.pathname === '/signup');
  }, [location.pathname, setSignupMode]);

  // WHY: Reset form when switching between login/signup modes
  useEffect(() => {
    resetForm();
    resetAuthState();
  }, [isSignupMode, resetForm, resetAuthState]);

  if (isAuthenticated && user && !showSuccess) {
    const redirectTo = getRedirectPath(location, user);
    return <Navigate to={redirectTo} replace />;
  }

  if (loading && isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#061421] relative overflow-hidden">
      <SlidingAuthContainer
        isSignupMode={isSignupMode}
        formState={formState}
        loading={loading}
        error={error}
        showSuccess={showSuccess}
        isFormValid={isFormValid}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        getError={getError}
      />
    </div>
  );
}

/**
 * Determines redirect path based on location state and user role.
 *
 * Prioritizes the original intended destination over default paths.
 * Provides role-based routing for different user types.
 */
function getRedirectPath(
  location: { state?: { from?: { pathname?: string } } },
  user: { role?: string }
): string {
  return (
    location.state?.from?.pathname ||
    (user.role === 'admin' ? '/admin/dashboard' : '/')
  );
}

/**
 * Loading screen component for authentication state.
 *
 * Displays a loading skeleton during authentication transitions.
 * Maintains consistent visual feedback during login/logout processes.
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#061421] flex items-center justify-center">
      <LoadingSkeleton />
    </div>
  );
}
