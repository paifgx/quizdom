import React from 'react';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { AuthActions } from './auth-actions';
import { translate } from '../../utils/translations';

interface FormState {
  email?: string;
  password?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}

export interface AuthPanelProps {
  mode: 'login' | 'signup';
  formState: FormState;
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
  const title = isSignupMode
    ? translate('auth.createAccount')
    : translate('auth.welcomeBack');
  const subtitle = isSignupMode
    ? translate('auth.signupSubtitle')
    : translate('auth.loginSubtitle');

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            aria-live="polite"
          >
            {title}
          </h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6">
            {translate('auth.accountCreated')}
          </div>
        )}

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg animate-fade-in"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {isSignupMode ? (
            <SignupForm
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
              email={formState.email || ''}
              password={formState.password || ''}
              rememberMe={formState.rememberMe || false}
              loading={loading}
              error={error}
              isFormValid={isFormValid}
              onEmailChange={value => onFieldChange('email', value)}
              onPasswordChange={value => onFieldChange('password', value)}
              onRememberMeChange={checked =>
                onFieldChange('rememberMe', checked)
              }
              onSubmit={onSubmit}
              getError={getError}
            />
          )}

          <AuthActions
            isSignupMode={isSignupMode}
            loading={loading}
            isFormValid={isFormValid}
            rememberMe={formState.rememberMe}
            onRememberMeChange={checked => onFieldChange('rememberMe', checked)}
          />
        </form>
      </div>
    </div>
  );
}
