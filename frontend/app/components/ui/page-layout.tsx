import { type ReactNode } from 'react';
import { translate } from '../../utils/translations';

export interface AuthPageLayoutProps {
  children: ReactNode;
}

/**
 * Reusable layout component for authentication pages
 * Provides consistent split layout with form on left, logo on right
 */
export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#061421] flex overflow-hidden relative">
      {/* Form Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">{children}</div>
      </div>

      {/* Logo Container */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#061421] to-gray-900">
        <div className="text-center">
          <img
            src="/logo/Logo_Quizdom_transparent.png"
            alt="Quizdom Logo"
            className="h-64 w-64 mx-auto mb-8 opacity-90 transition-all duration-700 hover:scale-110"
          />
          <h2 className="text-4xl font-bold text-[#FCC822] mb-4 transition-all duration-700">
            QUIZDOM
          </h2>
          <p className="text-xl text-gray-300 transition-all duration-700">
            {translate('landing.tagline')}
          </p>
        </div>
      </div>
    </div>
  );
}
