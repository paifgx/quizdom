/**
 * Game context to provide session ID and game service to all game components.
 */
import React, { createContext, useContext } from 'react';
import { gameService, GameService } from '../services/game';

interface GameContextValue {
  sessionId: number | null;
  gameService: GameService;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({
  children,
  sessionId,
}: {
  children: React.ReactNode;
  sessionId: number | null;
}) {
  return (
    <GameContext.Provider value={{ sessionId, gameService }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
} 