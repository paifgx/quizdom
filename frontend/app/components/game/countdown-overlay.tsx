/**
 * CountdownOverlay component for pre-game countdown.
 * Displays a 5-second countdown before game start.
 */
import React, { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  startAt: string;
  seconds: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function CountdownOverlay({
  startAt,
  seconds = 5,
  onComplete,
  onCancel,
}: CountdownOverlayProps) {
  const [currentSeconds, setCurrentSeconds] = useState(seconds);
  const [displayText, setDisplayText] = useState(seconds.toString());

  useEffect(() => {
    // Calculate actual countdown based on server time
    const serverStartTime = new Date(startAt).getTime();
    const now = Date.now();
    const elapsed = Math.max(0, (now - serverStartTime) / 1000);
    const remaining = Math.max(0, seconds - elapsed);

    // Start countdown
    let current = Math.ceil(remaining);
    setCurrentSeconds(current);

    const interval = setInterval(() => {
      current -= 1;

      if (current <= 0) {
        clearInterval(interval);
        setDisplayText('GO!');
        // Trigger completion after showing GO!
        setTimeout(() => {
          onComplete?.();
        }, 500);
      } else {
        setCurrentSeconds(current);
        setDisplayText(current.toString());
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      onCancel?.();
    };
  }, [startAt, seconds, onComplete, onCancel]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-8 text-white animate-slide-down">
          Spiel startet in
        </h2>
        <div
          className={`text-9xl font-bold text-[#FCC822] transition-all duration-300 ${
            currentSeconds <= 3 ? 'animate-pulse' : ''
          } ${displayText === 'GO!' ? 'scale-125 animate-bounce' : ''}`}
        >
          {displayText}
        </div>
      </div>
    </div>
  );
}
