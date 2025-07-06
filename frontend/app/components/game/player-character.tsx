import React from 'react';
import { CharacterDisplay } from './character-display';
import { HeartsDisplay } from './hearts-display';
import { ScoreDisplay } from './score-display';
import type { PlayerState } from '../../types/game';
import type { PlayerDamageStates } from '../../hooks/usePlayerDamage';

interface PlayerCharacterProps {
  player: PlayerState;
  playerDamageStates: PlayerDamageStates;
  avatarSrc: string;
  alt: string;
  className?: string;
  characterClassName?: string;
}

/**
 * A reusable component to display a player's character, including score, avatar, and hearts.
 */
export function PlayerCharacter({
  player,
  playerDamageStates,
  avatarSrc,
  alt,
  className,
  characterClassName,
}: PlayerCharacterProps) {
  return (
    <div
      className={`text-center flex flex-col items-center gap-6 ${className}`}
    >
      <ScoreDisplay score={player.score} />
      <CharacterDisplay
        src={avatarSrc}
        alt={alt}
        className={characterClassName}
        hearts={player.hearts}
        previousHearts={playerDamageStates[player.id]?.previousHearts}
        onDamage={playerDamageStates[player.id]?.onDamage}
      />
      <HeartsDisplay hearts={player.hearts} maxHearts={3} />
    </div>
  );
}
