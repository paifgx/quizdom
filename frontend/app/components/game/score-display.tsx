/**
 * Score display component for showing player or team scores.
 * Displays score with animation on score updates.
 */
import React, { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number;
  label?: string;
  playerName?: string;
  className?: string;
  showAnimation?: boolean;
}

export function ScoreDisplay({
  score,
  label = 'SCORE',
  playerName,
  className = '',
  showAnimation = true,
}: ScoreDisplayProps) {
  const [previousScore, setPreviousScore] = useState(score);
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Detect score change and trigger animation
  useEffect(() => {
    if (score !== previousScore && showAnimation) {
      const change = score - previousScore;
      setScoreChange(change);
      setIsAnimating(true);

      // Clear animation after duration
      setTimeout(() => {
        setScoreChange(null);
        setIsAnimating(false);
      }, 1500);
    }
    setPreviousScore(score);
  }, [score, previousScore, showAnimation]);

  return (
    <div className={`relative ${className}`}>
      {/* Main score display */}
      <div className="bg-gray-800/80 rounded-lg border border-gray-600 px-3 py-1.5">
        {playerName && (
          <div className="text-white font-bold text-xs">{playerName}</div>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-[#FCC822] font-bold text-xs uppercase tracking-wider">
            {label}
          </span>
          <span
            className={`text-white font-bold text-lg md:text-xl transition-transform ${
              isAnimating ? 'scale-110' : ''
            }`}
          >
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Score change animation */}
      {scoreChange !== null && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            animation: 'floatUp 1.5s ease-out forwards',
          }}
        >
          <span
            className={`font-bold text-lg ${
              scoreChange > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {scoreChange > 0 ? '+' : ''}
            {scoreChange}
          </span>
        </div>
      )}

      {/* Pulse effect on score increase */}
      {isAnimating && scoreChange && scoreChange > 0 && (
        <div className="absolute inset-0 rounded-lg animate-pulse">
          <div className="absolute inset-0 bg-[#FCC822]/10 rounded-lg" />
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -30px);
          }
        }
      `}</style>
    </div>
  );
}
