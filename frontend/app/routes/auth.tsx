import React, { useState, useCallback, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/auth';
import { useAuthUI } from '../contexts/auth-ui';
import { useAuthForm } from '../hooks/useAuthForm';
import { SlidingAuthContainer, LoadingSkeleton } from '../components';
import { authService } from '../services/auth';

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
 * Authentication page component with sliding login/signup panels
 * Handles both login and signup flows with smooth transitions
 */
export default function AuthPage() {
  const { login, isAuthenticated, user } = useAuth();
  const { isSignupMode, setSignupMode } = useAuthUI();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { formState, handleFieldChange, isFormValid, resetForm, getError } =
    useAuthForm(isSignupMode);

  const handleLogin = useCallback(async () => {
    try {
      const response = await authService.login({
        email: formState.email,
        password: formState.password,
      });

      console.log('Login successful:', response.user);

      // Update auth context with real user data
      await login(formState.email, formState.password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [formState.email, formState.password, login]);

  const handleSignup = useCallback(async () => {
    try {
      const response = await authService.register({
        email: formState.email,
        password: formState.password,
      });

      console.log('Registration successful:', response.user);
      setShowSuccess(true);

      // Auto-login after successful registration
      setTimeout(async () => {
        setShowSuccess(false);
        await login(formState.email, formState.password);
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, [formState.email, formState.password, login]);

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
    [isSignupMode, handleLogin, handleSignup]
  );

  const handleAuthError = (isSignup: boolean, error: unknown) => {
    let errorMessage = isSignup
      ? 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
      : 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';

    // Extract error message from response if available
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
  };

  const resetAuthState = () => {
    setError('');
    setShowSuccess(false);
  };

  // Sync with URL changes
  useEffect(() => {
    setSignupMode(location.pathname === '/signup');
  }, [location.pathname, setSignupMode]);

  // Reset form when mode changes
  useEffect(() => {
    resetForm();
    resetAuthState();
  }, [isSignupMode, resetForm]);

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
 * Determines redirect path based on location state and user role
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
 * Loading screen component for authentication state
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#061421] flex items-center justify-center">
      <LoadingSkeleton />
    </div>
  );
}
