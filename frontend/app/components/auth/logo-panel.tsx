import React from 'react';

export interface LogoPanelProps {
  position: 'left' | 'right';
}

/**
 * Reusable logo panel component for auth pages
 * Shows brand logo and information with gradient background
 */
export function LogoPanel({ position }: LogoPanelProps) {
  const gradientClass = position === 'left' 
    ? 'bg-gradient-to-br from-gray-900 to-[#061421]'
    : 'bg-gradient-to-br from-[#061421] to-gray-900';

  return (
    <div className={`hidden lg:flex flex-1 items-center justify-center ${gradientClass}`}>
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
          Rise of the Wise
        </p>
      </div>
    </div>
  );
} 