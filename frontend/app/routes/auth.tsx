import React, { useState, useCallback, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/auth';
import { useAuthUI } from '../contexts/auth-ui';
import { useAuthForm } from '../hooks/useAuthForm';
import { SlidingAuthContainer, LoadingSkeleton } from '../components';

export function meta() {
  return [
    { title: 'Authentication | Quizdom' },
    { name: 'description', content: 'Login or create your Quizdom account.' },
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        if (isSignupMode) {
          await handleSignup();
        } else {
          await login(formState.email, formState.password);
        }
      } catch {
        handleAuthError(isSignupMode);
      } finally {
        setLoading(false);
      }
    },
    [isSignupMode, formState, login]
  );

  const handleSignup = async () => {
    // TODO: Implement actual signup logic
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setError('Signup functionality coming soon!');
    }, 2000);
  };

  const handleAuthError = (isSignup: boolean) => {
    setError(
      isSignup
        ? 'Signup failed. Please try again.'
        : 'Login failed. Please check your credentials.'
    );
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
  user: { role: string }
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
