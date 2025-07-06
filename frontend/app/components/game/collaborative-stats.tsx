import React from 'react';
import { ScoreDisplay } from './score-display';
import { HeartsDisplay } from './hearts-display';
import type { useGameWithBackend } from '../../hooks/useGameWithBackend';

type GameState = ReturnType<typeof useGameWithBackend>['gameState'];

interface CollaborativeStatsProps {
  gameState: GameState;
}

/**
 * Displays the collaborative team's stats, including team score, hearts, and individual player status.
 */
export function CollaborativeStats({ gameState }: CollaborativeStatsProps) {
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <ScoreDisplay score={gameState.teamScore || 0} label="TEAM SCORE" />
      <HeartsDisplay
        hearts={gameState.teamHearts || 0}
        maxHearts={3}
        isTeamHearts
      />
      <div className="hidden md:flex gap-2">
        {gameState.players.map(player => (
          <div
            key={player.id}
            className={`px-2 py-1 rounded text-xs font-medium ${
              player.hasAnswered
                ? 'bg-green-600/50 text-white'
                : 'bg-gray-700/50 text-gray-400'
            }`}
          >
            {player.name}
          </div>
        ))}
      </div>
    </div>
  );
}
