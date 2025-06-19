import React from 'react';
import { Link } from 'react-router';
import { ValidatedInput } from './validated-input';

export interface ForgotPasswordFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
  emailError?: string;
  hasEmailError: boolean;
}

/**
 * Form component for forgot password email input
 * Handles email input and submission with validation
 */
export function ForgotPasswordForm({
  email,
  onEmailChange,
  onSubmit,
  loading,
  error,
  emailError,
  hasEmailError,
}: ForgotPasswordFormProps) {
  return (
    <>
      {/* Error Message */}
      {error && (
        <div
          className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg animate-fade-in"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Reset Form */}
      <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
        <ValidatedInput
          id="email"
          name="email"
          type="email"
          placeholder="Geben Sie Ihre E-Mail-Adresse ein"
          value={email}
          onChange={onEmailChange}
          error={emailError}
          autoComplete="email"
          required
        />

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading || !email || hasEmailError}
            className="btn-gradient w-full py-3 px-4 rounded-lg text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-95"
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
                E-Mail zum Zurücksetzen senden...
              </span>
            ) : (
              'E-Mail zum Zurücksetzen senden'
            )}
          </button>

          <Link
            to="/login"
            className="block w-full py-3 px-4 text-center border border-gray-300 text-gray-700 bg-white rounded-lg text-base font-medium hover:bg-gray-50 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Brauchen Sie Hilfe?</strong> Falls Sie die E-Mail innerhalb weniger Minuten nicht erhalten, überprüfen Sie Ihren Spam-Ordner oder versuchen Sie es mit einer anderen E-Mail-Adresse.
        </p>
      </div>
    </>
  );
}
