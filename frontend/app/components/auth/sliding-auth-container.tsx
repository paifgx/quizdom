import React from 'react';
import { AuthPanel } from './auth-panel';
import { LogoPanel } from './logo-panel';

interface FormState {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}

export interface SlidingAuthContainerProps {
  isSignupMode: boolean;
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
 * Container with sliding animation for login/signup panels
 * Manages the transition between login and signup modes
 */
export function SlidingAuthContainer({
  isSignupMode,
  formState,
  loading,
  error,
  showSuccess,
  isFormValid,
  onFieldChange,
  onSubmit,
  getError,
}: SlidingAuthContainerProps) {
  return (
    <div className="relative w-full h-screen">
      <div
        className="absolute inset-0 flex w-[200%] transition-transform duration-700 ease-in-out"
        style={{
          transform: isSignupMode ? 'translateX(-50%)' : 'translateX(0%)',
        }}
      >
        {/* Login Panel */}
        <div className="w-1/2 flex min-h-screen">
          <AuthPanel
            mode="login"
            formState={formState}
            loading={loading && !isSignupMode}
            error={!isSignupMode ? error : ''}
            showSuccess={false}
            isFormValid={isFormValid}
            onFieldChange={onFieldChange}
            onSubmit={onSubmit}
            getError={getError}
          />
          <LogoPanel position="right" />
        </div>

        {/* Signup Panel */}
        <div className="w-1/2 flex min-h-screen">
          <LogoPanel position="left" />
          <AuthPanel
            mode="signup"
            formState={formState}
            loading={loading && isSignupMode}
            error={isSignupMode ? error : ''}
            showSuccess={showSuccess}
            isFormValid={isFormValid}
            onFieldChange={onFieldChange}
            onSubmit={onSubmit}
            getError={getError}
          />
        </div>
      </div>
    </div>
  );
}
