import React from 'react';
import { ScoreDisplay } from './score-display';
import type { useGameWithBackend } from '../../hooks/useGameWithBackend';

type GameState = ReturnType<typeof useGameWithBackend>['gameState'];

interface CollaborativeCharactersProps {
  gameState: GameState;
}

/**
 * Displays the characters and individual scores for the collaborative team mode.
 */
export function CollaborativeCharacters({
  gameState,
}: CollaborativeCharactersProps) {
  return (
    <div className="flex justify-center items-end gap-4 mt-8">
      <div className="text-center flex flex-col items-center gap-2">
        <img
          src="/avatars/player_male_with_greataxe.png"
          alt="Alex"
          className="h-20 md:h-24 lg:h-28 w-auto"
        />
        <ScoreDisplay score={gameState.players[0]?.score || 0} />
      </div>
      <div className="flex items-center mb-4">
        <span className="text-[#FCC822] text-base font-bold px-2">TEAM</span>
      </div>
      <div className="text-center flex flex-col items-center gap-2">
        <img
          src="/avatars/player_female_sword_magic.png"
          alt="Sophia"
          className="h-20 md:h-24 lg:h-28 w-auto"
        />
        <ScoreDisplay score={gameState.players[1]?.score || 0} />
      </div>
    </div>
  );
}
