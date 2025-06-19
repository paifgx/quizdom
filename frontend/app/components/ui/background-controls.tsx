import React from 'react';
import { useBackgroundImage } from '../../hooks/useBackgroundImage';

interface BackgroundControlsProps {
  className?: string;
}

/**
 * Component that provides background control functionality
 * Can be used in any page to dynamically change backgrounds
 */
export function BackgroundControls({
  className = '',
}: BackgroundControlsProps) {
  const { backgroundImage, setBackgroundImage, setToRouteDefault } =
    useBackgroundImage();

  const backgroundOptions = [
    { name: 'Default', action: setToRouteDefault },
    { name: 'Pink', image: '/background/background_pink.png' },
    { name: 'Orange', image: '/background/background_orange.png' },
    { name: 'Day', image: '/background/background_day.png' },
    { name: 'Night', image: '/background/backgroud_night.png' },
  ];

  return (
    <div className={`p-4 bg-white/90 rounded-lg shadow-lg ${className}`}>
      <h3 className="text-sm font-semibold mb-3 text-gray-800">
        Change Background
      </h3>
      <div className="flex flex-wrap gap-2">
        {backgroundOptions.map(option => (
          <button
            key={option.name}
            onClick={() =>
              option.image
                ? setBackgroundImage(option.image)
                : option.action?.()
            }
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {option.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Current: {backgroundImage.split('/').pop()}
      </p>
    </div>
  );
}
