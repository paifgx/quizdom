/**
 * Hearts display component for showing remaining lives.
 * Displays heart icons with animation on heart loss.
 */
import React, { useEffect, useState } from 'react';

interface HeartsDisplayProps {
  hearts: number;
  maxHearts: number;
  playerName?: string;
  className?: string;
  isTeamHearts?: boolean;
}

export function HeartsDisplay({
  hearts,
  maxHearts,
  playerName,
  className = '',
  isTeamHearts = false,
}: HeartsDisplayProps) {
  const [animatingHeart, setAnimatingHeart] = useState<number | null>(null);
  const [previousHearts, setPreviousHearts] = useState(hearts);

  // Detect heart loss and trigger animation
  useEffect(() => {
    if (hearts < previousHearts) {
      setAnimatingHeart(hearts);
      setTimeout(() => setAnimatingHeart(null), 600);
    }
    setPreviousHearts(hearts);
  }, [hearts, previousHearts]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {playerName && (
        <span className="text-white font-bold text-xs">{playerName}</span>
      )}

      {isTeamHearts && (
        <span className="text-[#FCC822] font-bold text-xs">Team</span>
      )}

      <div className="flex gap-0.5">
        {Array.from({ length: maxHearts }, (_, i) => {
          const isFilled = i < hearts;
          const isAnimating = i === animatingHeart;

          return (
            <div
              key={i}
              className={`relative transition-transform duration-200 ${
                isAnimating ? 'animate-heartLoss' : ''
              }`}
            >
              <img
                src={
                  isFilled
                    ? '/hearts/heart_full.png'
                    : '/hearts/heart_empty.png'
                }
                alt={isFilled ? 'Full heart' : 'Empty heart'}
                className="w-6 h-6 md:w-7 md:h-7"
              />

              {/* Loss animation overlay */}
              {isAnimating && (
                <div className="absolute inset-0 animate-ping">
                  <img
                    src="/hearts/heart_full.png"
                    alt=""
                    className="w-6 h-6 md:w-7 md:h-7 opacity-50"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes heartLoss {
          0% { transform: scale(1); }
          50% { transform: scale(1.3) rotate(-10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .animate-heartLoss {
          animation: heartLoss 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
