import { Link } from 'react-router';

export interface ForgotPasswordSuccessProps {
  email: string;
  onSendAnother: () => void;
}

/**
 * Success state component for forgot password flow
 * Shows confirmation and next step options
 */
export function ForgotPasswordSuccess({
  email,
  onSendAnother,
}: ForgotPasswordSuccessProps) {
  return (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="E-Mail gesendet"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 7.89a2 2 0 002.83 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg">
        <p className="font-medium">E-Mail erfolgreich gesendet!</p>
        <p className="text-sm mt-1">
          Wir haben Anweisungen zum Zurücksetzen des Passworts an <strong>{email}</strong> gesendet
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onSendAnother}
          className="w-full py-3 px-4 border border-gray-300 text-gray-700 bg-white rounded-lg text-base font-medium hover:bg-gray-50 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
        >
          Weitere E-Mail senden
        </button>

        <Link
          to="/login"
          className="block w-full py-3 px-4 text-center text-[#FCC822] hover:text-[#FFCD2E] transition-colors duration-200 font-medium"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    </div>
  );
}
