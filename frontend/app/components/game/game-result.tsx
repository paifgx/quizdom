/**
 * Game result screen component.
 * Displays final score, result, and options after game completion.
 */
import React from 'react';
import type { GameResult } from '../../types/game';

interface GameResultScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onGoBack: () => void;
}

export function GameResultScreen({ result, onGoBack }: GameResultScreenProps) {
  const isWin = result.result === 'win';
  const stars = calculateStars(result.score, result.mode);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 rounded-xl border-2 border-[#FCC822] p-8 max-w-md w-full animate-scaleIn">
        {/* Result Header */}
        <div className="text-center mb-6">
          <h2
            className={`text-4xl font-bold mb-2 ${
              isWin ? 'text-[#FCC822]' : 'text-red-500'
            }`}
          >
            {isWin ? 'VICTORY!' : 'GAME OVER'}
          </h2>

          {/* Stars Display */}
          {isWin && (
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3].map(star => (
                <img
                  key={star}
                  src={
                    star <= stars
                      ? '/stars/star_full.png'
                      : '/stars/star_empty.png'
                  }
                  alt={star <= stars ? 'Full star' : 'Empty star'}
                  className={`w-12 h-12 transition-all duration-500 ${
                    star <= stars ? 'animate-starPop' : ''
                  }`}
                  style={{ animationDelay: `${star * 0.2}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-[#FCC822] text-lg font-bold mb-2">YOUR SCORE</p>
            <p className="text-white text-3xl font-bold">
              {result.score.toLocaleString()}
            </p>
          </div>

          {/* Wisecoin Reward */}
          {isWin && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <img
                src="/wisecoin/wisecoin.png"
                alt="Wisecoin"
                className="w-8 h-8"
              />
              <span className="text-[#FCC822] font-bold">
                +{calculateWisecoins(result.score)}
              </span>
            </div>
          )}

          {/* Hearts Remaining */}
          <div className="flex items-center justify-center gap-1 mt-4">
            <span className="text-white text-sm">Hearts remaining:</span>
            <div className="flex gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <img
                  key={i}
                  src={
                    i < result.heartsRemaining
                      ? '/hearts/heart_full.png'
                      : '/hearts/heart_empty.png'
                  }
                  alt={
                    i < result.heartsRemaining ? 'Full heart' : 'Empty heart'
                  }
                  className="w-6 h-6"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Single Action Button */}
        <button
          onClick={onGoBack}
          className="w-full flex items-center justify-center gap-2 bg-[#FCC822] hover:bg-[#FFD700] text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          <img src="/buttons/Home.png" alt="" className="w-6 h-6" />
          <span>Zurück zum Dashboard</span>
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes starPop {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.3) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-starPop {
          animation: starPop 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

// Helper functions
function calculateStars(score: number, _mode: string): number {
  // Basic star calculation - can be adjusted based on requirements
  if (score >= 500) return 3;
  if (score >= 300) return 2;
  if (score >= 100) return 1;
  return 0;
}

function calculateWisecoins(score: number): number {
  // Basic wisecoin calculation
  return Math.floor(score / 10);
}
