/**
 * Play button component for starting topic quizzes.
 * Provides navigation to game modes with topic context.
 */

import React from 'react';
import { NineSlicePanel } from '../nine-slice-quiz';

interface PlayButtonProps {
  /** Callback for play button click */
  onClick: () => void;
}

/**
 * Play button component with nine-slice panel styling.
 * Triggers navigation to game modes when clicked.
 *
 * @param props - Button properties including click handler
 * @returns JSX element for play button
 */
export function PlayButton({ onClick }: PlayButtonProps) {
  return (
    <div className="w-full lg:w-32">
      <NineSlicePanel
        className="cursor-pointer hover:scale-105 transition-all duration-200"
        onClick={onClick}
      >
        <span className="text-base lg:text-lg font-bold">SPIELEN</span>
      </NineSlicePanel>
    </div>
  );
}
