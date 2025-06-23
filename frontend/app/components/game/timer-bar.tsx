/**
 * Timer bar component for quiz games.
 * Displays countdown timer that turns red in the last 3 seconds.
 */
import React from 'react';

interface TimerBarProps {
  timeRemaining: number;
  timeLimit: number;
  className?: string;
}

export function TimerBar({
  timeRemaining,
  timeLimit,
  className = '',
}: TimerBarProps) {
  const percentage = (timeRemaining / timeLimit) * 100;
  const isUrgent = timeRemaining <= 3;

  // Don't show timer for infinite time limit (solo mode)
  if (timeLimit === Infinity) {
    return null;
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Timer label */}
      <div className="flex justify-between mb-1 text-xs font-bold">
        <span className={isUrgent ? 'text-red-500' : 'text-gray-300'}>
          Zeit
        </span>
        <span
          className={isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-300'}
        >
          {Math.ceil(timeRemaining)}s
        </span>
      </div>

      {/* Timer bar container */}
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        {/* Background */}
        <div className="absolute inset-0 bg-gray-900/50" />

        {/* Progress bar */}
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-100 ${
            isUrgent
              ? 'bg-gradient-to-r from-red-600 to-red-500 animate-pulse'
              : 'bg-gradient-to-r from-[#FCC822] to-[#FFD700]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
