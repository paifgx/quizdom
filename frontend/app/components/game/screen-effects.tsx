/**
 * Screen effects component for full-screen visual feedback.
 * Provides damage flash, screen shake, and other game effects.
 */
import React, { useState, useEffect } from 'react';

interface ScreenEffectsProps {
  showDamageFlash?: boolean;
  showScreenShake?: boolean;
  onEffectComplete?: () => void;
}

export function ScreenEffects({
  showDamageFlash = false,
  showScreenShake = false,
  onEffectComplete,
}: ScreenEffectsProps) {
  const [activeEffects, setActiveEffects] = useState({
    damageFlash: false,
    screenShake: false,
  });

  // Handle damage flash effect
  useEffect(() => {
    if (showDamageFlash) {
      setActiveEffects(prev => ({ ...prev, damageFlash: true }));

      setTimeout(() => {
        setActiveEffects(prev => ({ ...prev, damageFlash: false }));
        onEffectComplete?.();
      }, 400);
    }
  }, [showDamageFlash, onEffectComplete]);

  // Handle screen shake effect
  useEffect(() => {
    if (showScreenShake) {
      setActiveEffects(prev => ({ ...prev, screenShake: true }));

      setTimeout(() => {
        setActiveEffects(prev => ({ ...prev, screenShake: false }));
      }, 600);
    }
  }, [showScreenShake]);

  if (!activeEffects.damageFlash && !activeEffects.screenShake) {
    return null;
  }

  return (
    <>
      {/* Damage Flash Overlay */}
      {activeEffects.damageFlash && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-red-600 animate-screenDamageFlash" />

          {/* Damage vignette */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-900/20 to-red-900/40 animate-damageVignette" />

          {/* Screen crack effect */}
          <div className="absolute inset-0 opacity-30">
            <svg
              className="w-full h-full animate-screenCrack"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M20,30 Q40,20 60,35 T90,25"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.5"
                fill="none"
                className="animate-crackGlow"
              />
              <path
                d="M10,60 Q30,50 50,65 T80,55"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.3"
                fill="none"
                className="animate-crackGlow"
                style={{ animationDelay: '0.1s' }}
              />
              <path
                d="M40,80 Q60,70 80,85"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.4"
                fill="none"
                className="animate-crackGlow"
                style={{ animationDelay: '0.2s' }}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Screen Shake Container */}
      {activeEffects.screenShake && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="w-full h-full animate-screenShake" />
        </div>
      )}

      <style>{`
        @keyframes screenDamageFlash {
          0% { opacity: 0; }
          10% { opacity: 0.6; }
          20% { opacity: 0.3; }
          30% { opacity: 0.5; }
          40% { opacity: 0.2; }
          50% { opacity: 0.4; }
          60% { opacity: 0.1; }
          70% { opacity: 0.3; }
          80% { opacity: 0.05; }
          90% { opacity: 0.2; }
          100% { opacity: 0; }
        }

        @keyframes damageVignette {
          0% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1); }
        }

        @keyframes screenCrack {
          0% { opacity: 0; transform: scale(0.8); }
          30% { opacity: 0.4; transform: scale(1); }
          70% { opacity: 0.2; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.1); }
        }

        @keyframes crackGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.5)); }
          50% { filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); }
        }

        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2px, -1px); }
          20% { transform: translate(2px, 1px); }
          30% { transform: translate(-1px, -2px); }
          40% { transform: translate(1px, 2px); }
          50% { transform: translate(-1px, -1px); }
          60% { transform: translate(1px, 1px); }
          70% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
          90% { transform: translate(-1px, -1px); }
        }

        .animate-screenDamageFlash {
          animation: screenDamageFlash 0.4s ease-out;
        }

        .animate-damageVignette {
          animation: damageVignette 0.6s ease-out;
        }

        .animate-screenCrack {
          animation: screenCrack 0.8s ease-out;
        }

        .animate-crackGlow {
          animation: crackGlow 0.8s ease-out;
        }

        .animate-screenShake {
          animation: screenShake 0.6s ease-in-out;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </>
  );
}
