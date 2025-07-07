/**
 * WebSocket client for real-time game updates.
 * Handles connection, auto-reconnect, and event handling.
 */

// WebSocket URL Configuration
// In development, connect to local backend
// In production, use environment variable to connect to backend service
// In test environment, use mock URL
const WS_BASE_URL = import.meta.env.PROD
  ? (() => {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error(
          'VITE_API_URL environment variable is required in production'
        );
      }
      // Convert HTTP URL to WebSocket URL (http -> ws, https -> wss)
      return apiUrl.replace(
        /^https?:/,
        apiUrl.startsWith('https:') ? 'wss:' : 'ws:'
      );
    })()
  : import.meta.env.MODE === 'test'
    ? 'ws://localhost:8000' // Mock URL for tests
    : 'ws://localhost:8000'; // Development URL

// Connection status
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

// WebSocket events from server
export interface QuestionEvent {
  type: 'question';
  question: {
    id: string;
    text: string;
    answers: string[];
    answerIds: number[];
  };
  index: number;
  playersAnswered: string[];
}

export interface AnswerEvent {
  type: 'answer';
  playerId: string;
  isCorrect: boolean;
  score: number;
}

export interface CompleteEvent {
  type: 'complete';
  scores: Record<string, number>;
}

// New lobby-related events
export interface BaseWebSocketEvent<T = unknown> {
  event: string;
  payload?: T;
}

export interface PlayerReadyEvent extends BaseWebSocketEvent {
  event: 'player-ready';
  payload: {
    players: Array<{
      id: string;
      name: string;
      score: number;
      hearts: number;
      is_host: boolean;
      ready: boolean;
    }>;
  };
}

export interface SessionCountdownEvent extends BaseWebSocketEvent {
  event: 'session-countdown';
  payload: {
    seconds: number;
    start_at: string;
  };
}

export interface SessionPausedEvent extends BaseWebSocketEvent {
  event: 'session-paused';
  payload: {
    status: string;
  };
}

export interface SessionStartEvent extends BaseWebSocketEvent {
  event: 'session-start';
  payload: {
    started_at: string;
  };
}

export interface PlayerJoinedEvent extends BaseWebSocketEvent {
  event: 'player-joined';
  payload: {
    players: Array<{
      id: string;
      name: string;
      score: number;
      hearts: number;
      is_host: boolean;
    }>;
  };
}

export type GameEvent = QuestionEvent | AnswerEvent | CompleteEvent;
export type WebSocketEvent =
  | BaseWebSocketEvent
  | PlayerReadyEvent
  | SessionCountdownEvent
  | SessionPausedEvent
  | SessionStartEvent
  | PlayerJoinedEvent;

export type AnyGameEvent = GameEvent | WebSocketEvent;

// WebSocket options
interface WebSocketOptions {
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  maxReconnectInterval?: number;
}

const defaultOptions = {
  maxReconnectAttempts: 5,
  reconnectInterval: 1000,
  maxReconnectInterval: 30000,
};

/**
 * WebSocket client for real-time game communication.
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private options: WebSocketOptions;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Event callbacks
  private onStatusChangeCallbacks: Array<(status: ConnectionStatus) => void> =
    [];
  private onMessageCallbacks: Array<(event: AnyGameEvent) => void> = [];
  private onErrorCallbacks: Array<(error: Event) => void> = [];

  constructor(sessionId: string, options: WebSocketOptions = {}) {
    this.sessionId = sessionId;
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * Connect to WebSocket server with authentication token.
   */
  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.setStatus(ConnectionStatus.CONNECTING);

    const token =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('quizdom_access_token')
        : null;
    const url = `${WS_BASE_URL}/v1/game/session/${this.sessionId}/ws?token=${token}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.setStatus(ConnectionStatus.CONNECTED);
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          // Check if it's a lobby/server event or a game event
          if (data.event) {
            // It's a WebSocketEvent with event/payload structure
            this.onMessageCallbacks.forEach(callback =>
              callback(data as AnyGameEvent)
            );
          } else if (data.type) {
            // It's a GameEvent with type structure
            this.onMessageCallbacks.forEach(callback =>
              callback(data as GameEvent)
            );
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = event => {
        this.setStatus(ConnectionStatus.DISCONNECTED);

        // If not a normal closure (1000), attempt to reconnect
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < (this.options.maxReconnectAttempts || 5)
        ) {
          this.reconnect();
        } else if (event.code !== 1000) {
          this.setStatus(ConnectionStatus.FAILED);
        }
      };

      this.ws.onerror = error => {
        this.onErrorCallbacks.forEach(callback => callback(error));
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.setStatus(ConnectionStatus.FAILED);
    }
  }

  /**
   * Reconnect with exponential backoff.
   */
  private reconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.setStatus(ConnectionStatus.RECONNECTING);
    this.reconnectAttempts += 1;

    // Calculate backoff interval with jitter
    const backoff = Math.min(
      this.options.maxReconnectInterval || 30000,
      (this.options.reconnectInterval || 1000) *
        Math.pow(2, this.reconnectAttempts - 1)
    );
    const jitter = Math.random() * 0.5 * backoff;
    const interval = Math.floor(backoff + jitter);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, interval);
  }

  /**
   * Close WebSocket connection.
   */
  close(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }

    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Update connection status and notify listeners.
   */
  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.onStatusChangeCallbacks.forEach(callback => callback(status));
  }

  /**
   * Get current connection status.
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Register status change callback.
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.onStatusChangeCallbacks.push(callback);
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Register message callback.
   */
  onMessage(callback: (event: AnyGameEvent) => void): () => void {
    this.onMessageCallbacks.push(callback);
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Register error callback.
   */
  onError(callback: (error: Event) => void): () => void {
    this.onErrorCallbacks.push(callback);
    return () => {
      this.onErrorCallbacks = this.onErrorCallbacks.filter(
        cb => cb !== callback
      );
    };
  }
}

/**
 * Create a new WebSocket connection for the given session.
 */
export function connect(
  sessionId: string,
  options?: WebSocketOptions
): WebSocketClient {
  const client = new WebSocketClient(sessionId, options);
  client.connect();
  return client;
}

// Export singleton factory
export default connect;
