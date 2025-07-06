import { useState, useEffect } from 'react';
import type { PlayerState } from '../types/game';

type PlayerDamageStateValue = {
  hearts: number;
  previousHearts: number;
  onDamage: boolean;
};

export type PlayerDamageStates = Record<string, PlayerDamageStateValue>;

/**
 * Custom hook to manage player damage states, including flash animations.
 * @param players The list of players in the game.
 * @returns An object with player damage states and a function to trigger heart loss.
 */
export function usePlayerDamage(players: PlayerState[]) {
  const [playerDamageStates, setPlayerDamageStates] =
    useState<PlayerDamageStates>({});

  useEffect(() => {
    const initialStates: PlayerDamageStates = {};
    players.forEach(player => {
      initialStates[player.id] = {
        hearts: player.hearts,
        previousHearts: player.hearts,
        onDamage: false,
      };
    });
    setPlayerDamageStates(initialStates);
  }, [players]);

  const onHeartLoss = (event: {
    playerId?: string;
    heartsRemaining: number;
  }) => {
    if (event.playerId) {
      const playerId = event.playerId;
      setPlayerDamageStates(prev => ({
        ...prev,
        [playerId]: {
          hearts: event.heartsRemaining,
          previousHearts: prev[playerId]?.hearts ?? event.heartsRemaining + 1,
          onDamage: true,
        },
      }));

      setTimeout(() => {
        setPlayerDamageStates(prev => {
          if (!prev[playerId]) return prev;
          return {
            ...prev,
            [playerId]: {
              ...prev[playerId],
              onDamage: false,
            },
          };
        });
      }, 100);
    }
  };

  return { playerDamageStates, onHeartLoss };
}
