/**
 * Hearts display component for showing remaining lives.
 * Displays heart icons with enhanced animation on heart loss.
 */
import React, { useEffect, useState } from 'react';

interface HeartsDisplayProps {
  hearts: number;
  maxHearts: number;
  playerName?: string;
  className?: string;
  isTeamHearts?: boolean;
  onHeartLoss?: () => void; // Callback for triggering screen effects
}

export function HeartsDisplay({
  hearts,
  maxHearts,
  playerName,
  className = '',
  isTeamHearts = false,
  onHeartLoss,
}: HeartsDisplayProps) {
  const [animatingHeart, setAnimatingHeart] = useState<number | null>(null);
  const [previousHearts, setPreviousHearts] = useState(hearts);
  const [showDamageEffect, setShowDamageEffect] = useState(false);

  // Detect heart loss and trigger animation
  useEffect(() => {
    if (hearts < previousHearts) {
      setAnimatingHeart(hearts);
      setShowDamageEffect(true);

      // Trigger screen effect callback
      onHeartLoss?.();

      // Clear animations after duration
      setTimeout(() => {
        setAnimatingHeart(null);
        setShowDamageEffect(false);
      }, 800);
    }
    setPreviousHearts(hearts);
  }, [hearts, previousHearts, onHeartLoss]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {playerName && (
        <span className="text-white font-bold text-xs">{playerName}</span>
      )}

      {isTeamHearts && (
        <span className="text-[#FCC822] font-bold text-xs">Team</span>
      )}

      <div
        className={`flex gap-0.5 ${showDamageEffect ? 'animate-damageShake' : ''}`}
      >
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

              {/* Enhanced loss animation overlay */}
              {isAnimating && (
                <>
                  {/* Ping effect */}
                  <div className="absolute inset-0 animate-ping opacity-75">
                    <img
                      src="/hearts/heart_full.png"
                      alt=""
                      className="w-6 h-6 md:w-7 md:h-7 opacity-50"
                    />
                  </div>

                  {/* Break effect */}
                  <div className="absolute inset-0 animate-heartBreak">
                    <img
                      src="/hearts/heart_full.png"
                      alt=""
                      className="w-6 h-6 md:w-7 md:h-7 opacity-30"
                    />
                  </div>

                  {/* Damage sparkles */}
                  <div className="absolute -inset-2 pointer-events-none">
                    {[...Array(6)].map((_, sparkleIndex) => (
                      <div
                        key={sparkleIndex}
                        className="absolute w-1 h-1 bg-red-400 rounded-full animate-sparkle"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${sparkleIndex * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes heartLoss {
          0% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(1.4) rotate(-15deg); }
          40% { transform: scale(1.2) rotate(10deg); }
          60% { transform: scale(1.3) rotate(-8deg); }
          80% { transform: scale(1.1) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes heartBreak {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.1;
          }
          100% {
            transform: scale(0.8) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes damageShake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-2px) translateY(-1px); }
          20% { transform: translateX(2px) translateY(1px); }
          30% { transform: translateX(-1px) translateY(-2px); }
          40% { transform: translateX(1px) translateY(2px); }
          50% { transform: translateX(-1px) translateY(-1px); }
          60% { transform: translateX(1px) translateY(1px); }
          70% { transform: translateX(-1px) translateY(-1px); }
          80% { transform: translateX(1px) translateY(1px); }
          90% { transform: translateX(-1px) translateY(-1px); }
        }

        @keyframes sparkle {
          0% {
            opacity: 1;
            transform: scale(0) translateY(0);
          }
          50% {
            opacity: 1;
            transform: scale(1) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: scale(0) translateY(-20px);
          }
        }

        .animate-heartLoss {
          animation: heartLoss 0.8s ease-out;
        }

        .animate-heartBreak {
          animation: heartBreak 0.8s ease-out;
        }

        .animate-damageShake {
          animation: damageShake 0.6s ease-in-out;
        }

        .animate-sparkle {
          animation: sparkle 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
