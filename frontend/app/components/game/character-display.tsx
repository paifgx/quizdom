/**
 * Character display component with damage animations.
 * Shows player avatar with enhanced visual feedback on damage.
 */
import React, { useState, useEffect } from 'react';

interface CharacterDisplayProps {
  src: string;
  alt: string;
  className?: string;
  onDamage?: boolean; // Trigger damage animation
  hearts: number;
  previousHearts?: number;
}

export function CharacterDisplay({
  src,
  alt,
  className = '',
  onDamage = false,
  hearts,
  previousHearts,
}: CharacterDisplayProps) {
  const [isDamaged, setIsDamaged] = useState(false);
  const [showDamageEffect, setShowDamageEffect] = useState(false);

  // Detect damage and trigger effects
  useEffect(() => {
    if (previousHearts !== undefined && hearts < previousHearts) {
      setIsDamaged(true);
      setShowDamageEffect(true);

      // Clear effects after animation
      setTimeout(() => {
        setIsDamaged(false);
        setShowDamageEffect(false);
      }, 1000);
    }
  }, [hearts, previousHearts]);

  // Also respond to external damage trigger
  useEffect(() => {
    if (onDamage) {
      setIsDamaged(true);
      setShowDamageEffect(true);

      setTimeout(() => {
        setIsDamaged(false);
        setShowDamageEffect(false);
      }, 1000);
    }
  }, [onDamage]);

  return (
    <div className={`relative ${className}`}>
      {/* Character Image */}
      <img
        src={src}
        alt={alt}
        className={`transition-all duration-200 ${
          isDamaged ? 'animate-characterDamage' : ''
        } ${className.includes('h-') ? '' : 'h-32 md:h-40 lg:h-48'} w-auto`}
      />

      {/* Damage Flash Overlay */}
      {showDamageEffect && (
        <div className="absolute inset-0 bg-red-500 opacity-40 animate-damageFlash rounded-lg pointer-events-none" />
      )}

      {/* Impact Effect */}
      {showDamageEffect && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Shockwave */}
          <div className="absolute inset-0 border-2 border-red-400 rounded-full animate-shockwave opacity-60" />

          {/* Impact particles */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-red-400 rounded-full animate-impactParticle"
                style={
                  {
                    top: '50%',
                    left: '50%',
                    animationDelay: `${i * 0.05}s`,
                    '--particle-angle': `${i * 45}deg`,
                  } as React.CSSProperties & { '--particle-angle': string }
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Low health warning glow */}
      {hearts === 1 && (
        <div className="absolute -inset-1 bg-red-500/20 rounded-lg animate-pulse" />
      )}

      <style>{`
        @keyframes characterDamage {
          0%, 100% {
            transform: translateX(0) scale(1);
            filter: hue-rotate(0deg);
          }
          10% {
            transform: translateX(-4px) scale(0.98);
            filter: hue-rotate(-20deg);
          }
          20% {
            transform: translateX(4px) scale(1.02);
            filter: hue-rotate(20deg);
          }
          30% {
            transform: translateX(-3px) scale(0.99);
            filter: hue-rotate(-15deg);
          }
          40% {
            transform: translateX(3px) scale(1.01);
            filter: hue-rotate(15deg);
          }
          50% {
            transform: translateX(-2px) scale(0.995);
            filter: hue-rotate(-10deg);
          }
          60% {
            transform: translateX(2px) scale(1.005);
            filter: hue-rotate(10deg);
          }
          70% {
            transform: translateX(-1px) scale(0.998);
            filter: hue-rotate(-5deg);
          }
          80% {
            transform: translateX(1px) scale(1.002);
            filter: hue-rotate(5deg);
          }
          90% {
            transform: translateX(-0.5px) scale(0.999);
            filter: hue-rotate(-2deg);
          }
        }

        @keyframes damageFlash {
          0%, 100% { opacity: 0; }
          20% { opacity: 0.6; }
          40% { opacity: 0.3; }
          60% { opacity: 0.5; }
          80% { opacity: 0.2; }
        }

        @keyframes shockwave {
          0% {
            transform: scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        @keyframes impactParticle {
          0% {
            transform: translate(-50%, -50%) rotate(var(--particle-angle)) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--particle-angle)) translateY(-30px) scale(0);
            opacity: 0;
          }
        }

        .animate-characterDamage {
          animation: characterDamage 0.8s ease-out;
        }

        .animate-damageFlash {
          animation: damageFlash 0.6s ease-out;
        }

        .animate-shockwave {
          animation: shockwave 0.8s ease-out;
        }

        .animate-impactParticle {
          animation: impactParticle 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
