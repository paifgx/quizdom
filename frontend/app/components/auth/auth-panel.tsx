import React from 'react';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { AuthActions } from './auth-actions';

export interface AuthPanelProps {
  mode: 'login' | 'signup';
  formState: Record<string, any>;
  loading: boolean;
  error: string;
  showSuccess: boolean;
  isFormValid: boolean;
  onFieldChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  getError: (field: string) => string | undefined;
}

/**
 * Reusable auth panel component for login and signup forms
 * Handles form rendering and common UI elements
 */
export function AuthPanel({
  mode,
  formState,
  loading,
  error,
  showSuccess,
  isFormValid,
  onFieldChange,
  onSubmit,
  getError,
}: AuthPanelProps) {
  const isSignupMode = mode === 'signup';
  const title = isSignupMode ? 'Create Account!' : 'Welcome back!';
  const subtitle = isSignupMode 
    ? 'Please fill in your details to signup.' 
    : 'Please login to your account.';

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" aria-live="polite">
            {title}
          </h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6">
            Account created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div
              className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}

          {isSignupMode ? (
            <SignupForm
              firstName={formState.firstName || ''}
              lastName={formState.lastName || ''}
              email={formState.email || ''}
              password={formState.password || ''}
              confirmPassword={formState.confirmPassword || ''}
              loading={loading}
              error={error}
              isFormValid={isFormValid}
              onFieldChange={onFieldChange}
              onSubmit={onSubmit}
              getError={getError}
            />
          ) : (
            <LoginForm
              email={formState.email}
              password={formState.password}
              rememberMe={formState.rememberMe}
              loading={loading}
              error={error}
              isFormValid={isFormValid}
              onEmailChange={(value) => onFieldChange('email', value)}
              onPasswordChange={(value) => onFieldChange('password', value)}
              onRememberMeChange={(checked) => onFieldChange('rememberMe', checked)}
              onSubmit={onSubmit}
              getError={getError}
            />
          )}

          <AuthActions
            isSignupMode={isSignupMode}
            loading={loading}
            isFormValid={isFormValid}
            rememberMe={formState.rememberMe}
            onRememberMeChange={(checked) => onFieldChange('rememberMe', checked)}
          />
        </form>

        {!isSignupMode && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Player: player@quizdom.com</p>
              <p>Admin: admin@quizdom.com</p>
              <p>Password: any</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 