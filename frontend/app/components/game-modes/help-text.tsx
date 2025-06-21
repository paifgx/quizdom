import React from 'react';
import type { GameModeId } from '../../types/game';

interface HelpTextProps {
  selectedMode: GameModeId | null;
}

/**
 * Renders contextual help text based on the selected game mode.
 * Provides users with information about what each mode entails.
 * Only renders when a mode is selected.
 *
 * @param props - Component props
 * @param props.selectedMode - The currently selected game mode
 */
export function HelpText({ selectedMode }: HelpTextProps) {
  if (!selectedMode) return null;

  const helpMessage = getHelpMessage(selectedMode);

  return (
    <div className="mt-8 text-center">
      <p className="text-sm text-gray-400">{helpMessage}</p>
    </div>
  );
}

/**
 * Gets the appropriate help message for the selected game mode.
 */
function getHelpMessage(selectedMode: GameModeId): string {
  const helpMessages: Record<GameModeId, string> = {
    solo: 'Play at your own pace and improve your knowledge.',
    competitive: 'Challenge another player in real-time competition.',
    collaborative: 'Join forces with teammates to compete against others.',
  };

  return helpMessages[selectedMode];
}
