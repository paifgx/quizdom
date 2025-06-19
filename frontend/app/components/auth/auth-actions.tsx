import React from 'react';
import { Link } from 'react-router';

export interface AuthActionsProps {
  isSignupMode: boolean;
  loading: boolean;
  isFormValid: boolean;
  rememberMe?: boolean;
  onRememberMeChange?: (checked: boolean) => void;
}

/**
 * Auth action buttons and links component for login/signup forms
 */
export function AuthActions({
  isSignupMode,
  loading,
  isFormValid,
  rememberMe,
  onRememberMeChange,
}: AuthActionsProps) {
  return (
    <div className="space-y-6">
      {/* Remember Me & Forgot Password - Login only */}
      {!isSignupMode && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#FCC822] focus:ring-[#FCC822] border-gray-300 bg-white rounded"
              checked={rememberMe || false}
              onChange={e => onRememberMeChange?.(e.target.checked)}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember Me
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-[#FCC822] hover:text-[#FFCD2E] text-sm"
          >
            Forgot Password?
          </Link>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="btn-gradient w-full py-3 px-4 rounded-lg text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isSignupMode ? 'Creating Account...' : 'Logging in...'}
            </span>
          ) : isSignupMode ? (
            'Create Account'
          ) : (
            'Login'
          )}
        </button>

        <Link
          to={isSignupMode ? '/login' : '/signup'}
          className="w-full py-3 px-4 border border-gray-300 text-gray-700 bg-white rounded-lg text-base font-medium hover:bg-gray-50 transition-all duration-300 text-center block"
        >
          {isSignupMode ? 'Back to Login' : 'Sign Up'}
        </Link>
      </div>
    </div>
  );
}
