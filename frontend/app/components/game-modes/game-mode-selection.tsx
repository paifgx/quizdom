import React from 'react';
import { GameModeCard } from './game-mode-card';
import type { GameMode, GameModeId } from '../../types/game';

interface GameModeSelectionProps {
  gameModes: GameMode[];
  selectedMode: GameModeId | null;
  onModeSelect: (modeId: GameModeId) => void;
}

/**
 * Renders the game mode selection section with navigation role and cards.
 * Provides proper accessibility structure for mode selection.
 * Handles keyboard interactions through individual card components.
 *
 * @param props - Component props
 * @param props.gameModes - Available game modes to display
 * @param props.selectedMode - Currently selected game mode
 * @param props.onModeSelect - Callback when a mode is selected
 */
export function GameModeSelection({
  gameModes,
  selectedMode,
  onModeSelect,
}: GameModeSelectionProps) {
  return (
    <nav role="navigation" aria-label="Game mode selection">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-6">
        {gameModes.map(mode => (
          <GameModeCard
            key={mode.id}
            mode={mode}
            isSelected={selectedMode === mode.id}
            onSelect={onModeSelect}
          />
        ))}
      </div>
    </nav>
  );
}
