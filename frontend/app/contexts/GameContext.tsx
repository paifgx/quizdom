/**
 * Game context to provide session ID and game service to all game components.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { gameService, GameService, type PlayerMeta, type SessionMeta } from '../services/game';
import { connect, WebSocketClient } from '../services/ws';

interface GameContextValue {
  sessionId: string | null;
  gameService: GameService;
  players: PlayerMeta[];
  isHost: boolean;
  wsClient: WebSocketClient | null;
  sessionMeta: SessionMeta | null;
  updatePlayers: (newPlayers: PlayerMeta[]) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({
  children,
  sessionId,
  initialPlayers = [],
  initialSessionMeta = null,
}: {
  children: React.ReactNode;
  sessionId: string | null;
  initialPlayers?: PlayerMeta[];
  initialSessionMeta?: SessionMeta | null;
}) {
  const [players, setPlayers] = useState<PlayerMeta[]>(initialPlayers);
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [sessionMeta, _setSessionMeta] = useState<SessionMeta | null>(initialSessionMeta);
  
  // Determine if current user is the host
  const isHost = sessionMeta?.players?.some(player => player.isHost) || false;
  
  // Initialize WebSocket for multiplayer games
  useEffect(() => {
    // Only establish WebSocket for valid sessions
    if (sessionId && (sessionMeta?.mode === 'comp' || sessionMeta?.mode === 'collab')) {
      const client = connect(sessionId);
      setWsClient(client);
      
      return () => {
        client.close();
      };
    }
  }, [sessionId, sessionMeta?.mode]);
  
  const updatePlayers = (newPlayers: PlayerMeta[]) => {
    setPlayers(newPlayers);
  };

  return (
    <GameContext.Provider 
      value={{ 
        sessionId, 
        gameService, 
        players, 
        isHost, 
        wsClient, 
        sessionMeta,
        updatePlayers 
      }}
    >
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