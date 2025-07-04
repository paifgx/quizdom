/**
 * Quiz game route that handles the actual gameplay.
 * Supports all three game modes with proper state management.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { QuizGameContainer } from '../components/game';
import { LoadingSpinner } from '../components/home/loading-spinner';
import { gameService } from '../services/game';
import { GameProvider } from '../contexts/GameContext';
import { useAuthenticatedGame } from '../hooks/useAuthenticatedGame';
import { authService } from '../services/auth';
import type {
  Question,
  PlayerState,
  GameResult,
  GameModeId,
} from '../types/game';
import type { SessionMeta, PlayerMeta } from '../services/game';

export function meta() {
  return [
    { title: 'Quiz Game | Quizdom' },
    {
      name: 'description',
      content: 'Play the quiz game in your chosen mode.',
    },
  ];
}

export default function QuizGamePage() {
  const { topicId, quizId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticatedGame();

  const mode = searchParams.get('mode') as GameModeId | null;
  const existingSessionId = searchParams.get('sessionId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [title, setTitle] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);

  // Function to convert backend player data to frontend player state
  const convertPlayersData = useCallback(
    (playersMeta: PlayerMeta[]): PlayerState[] => {
      // For competitive mode, ensure proper ordering based on current user perspective
      if (mode === 'competitive' && playersMeta.length >= 2) {
        // Get the current user ID to determine which player is "us"
        const currentUser = authService.getUser();
        const currentUserId = currentUser?.id?.toString();

        if (!currentUserId) {
          console.warn('Could not determine current user ID');
          // Fallback to host-based ordering
          const sortedPlayers = [...playersMeta].sort((a, b) => {
            if (a.isHost && !b.isHost) return -1;
            if (!a.isHost && b.isHost) return 1;
            return 0;
          });

          return sortedPlayers.map((player, index) => ({
            id: index === 0 ? 'player1' : 'player2',
            name: player.name,
            score: player.score,
            hearts: player.hearts,
            hasAnswered: false,
          }));
        }

        // Find which player is the current user
        const currentUserPlayer = playersMeta.find(p => p.id === currentUserId);
        const opponentPlayer = playersMeta.find(p => p.id !== currentUserId);

        if (!currentUserPlayer || !opponentPlayer) {
          console.error(
            'Could not properly identify current user and opponent',
            {
              currentUserId,
              playersMeta,
              currentUserPlayer,
              opponentPlayer,
            }
          );
          // Fallback to original ordering
          return playersMeta.map((player, index) => ({
            id: `player${index + 1}`,
            name: player.name,
            score: player.score,
            hearts: player.hearts,
            hasAnswered: false,
          }));
        }

        // Always put current user as player1 (left side) and opponent as player2 (right side)
        return [
          {
            id: 'player1', // Left side - always current user
            name: currentUserPlayer.name,
            score: currentUserPlayer.score,
            hearts: currentUserPlayer.hearts,
            hasAnswered: false,
          },
          {
            id: 'player2', // Right side - always opponent
            name: opponentPlayer.name,
            score: opponentPlayer.score,
            hearts: opponentPlayer.hearts,
            hasAnswered: false,
          },
        ];
      }

      // For single player or other modes, just map directly
      return playersMeta.map((player, index) => ({
        id: `player${index + 1}`,
        name: player.name,
        score: player.score,
        hearts: player.hearts,
        hasAnswered: false,
      }));
    },
    [mode]
  );

  // Initialize a new game
  const initializeNewGame = useCallback(async () => {
    if (!mode) {
      navigate('/game-modes');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Starting new game session with mode:', mode);

      // Start a new game session based on whether we have topicId or quizId
      let sessionResponse;
      if (topicId) {
        console.log('Starting topic game with topicId:', topicId);
        sessionResponse = await gameService.startTopicGame(
          topicId,
          mode,
          10 // number of questions
        );
        console.log('Session response:', sessionResponse);
        setTitle(sessionResponse.topic_title || 'Topic Quiz');
      } else if (quizId) {
        console.log('Starting quiz game with quizId:', quizId);
        sessionResponse = await gameService.startQuizGame(quizId, mode);
        console.log('Session response:', sessionResponse);
        setTitle(sessionResponse.quiz_title || 'Quiz Game');
      } else {
        throw new Error('Neither topic ID nor quiz ID provided');
      }

      const sessionIdStr = sessionResponse.session_id.toString();
      console.log('Session ID:', sessionIdStr);
      setSessionId(sessionIdStr);

      // If this is a competitive game, show invite modal
      if (mode === 'competitive') {
        setShowInviteModal(true);
        setWaitingForPlayers(true);
      }

      // Initialize players based on the game mode
      setPlayers(initializePlayers(mode));

      try {
        // Load all questions for the session
        console.log(
          `Loading questions for session ${sessionResponse.session_id}`
        );
        const questionsData = await gameService.getAllQuestionsForSession(
          sessionResponse.session_id,
          sessionResponse.total_questions
        );
        console.log(`Successfully loaded ${questionsData.length} questions`);

        // Convert backend questions to frontend format
        const convertedQuestions: Question[] = questionsData.map(q => ({
          id: q.question_id.toString(),
          text: q.content,
          answers: q.answers.map(a => a.content),
          correctAnswer: -1, // Will be revealed after answering
          showTimestamp: q.show_timestamp,
          // Store answer IDs for submission
          answerIds: q.answers.map(a => a.id),
        }));

        setQuestions(convertedQuestions);
      } catch (questionError) {
        console.error('Failed to load questions:', questionError);
        setError(
          `Failed to load questions: ${questionError instanceof Error ? questionError.message : 'Unknown error'}`
        );
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError(
        err instanceof Error
          ? `Failed to start game: ${err.message}`
          : 'Failed to load game data'
      );
      setLoading(false);
    }
  }, [topicId, quizId, mode, navigate]);

  // Join an existing session
  const joinExistingSession = useCallback(async () => {
    if (!existingSessionId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Join the existing session
      const session = await gameService.joinSession(existingSessionId);
      setSessionId(session.sessionId);
      setSessionMeta(session);

      // Set title based on session data (to be improved when API includes this info)
      setTitle('Multiplayer Quiz');

      // Convert player metadata to frontend player state
      setPlayers(convertPlayersData(session.players));

      // Load all questions for the session
      const questionsData = await gameService.getAllQuestionsForSession(
        parseInt(session.sessionId),
        session.totalQuestions
      );

      // Convert backend questions to frontend format
      const convertedQuestions: Question[] = questionsData.map(q => ({
        id: q.question_id.toString(),
        text: q.content,
        answers: q.answers.map(a => a.content),
        correctAnswer: -1, // Will be revealed after answering
        showTimestamp: q.show_timestamp,
        // Store answer IDs for submission
        answerIds: q.answers.map(a => a.id),
      }));

      setQuestions(convertedQuestions);
      setLoading(false);
    } catch (err) {
      console.error('Failed to join session:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to join game session'
      );
      setLoading(false);
    }
  }, [existingSessionId, convertPlayersData]);

  // Initialize players based on game mode
  const initializePlayers = (gameMode: GameModeId) => {
    switch (gameMode) {
      case 'solo':
        return [
          {
            id: 'player1',
            name: 'Player',
            score: 0,
            hearts: 3,
          },
        ];
      case 'competitive':
        return [
          {
            id: 'player1',
            name: 'Player 1',
            score: 0,
            hearts: 3,
          },
          {
            id: 'player2',
            name: 'Player 2',
            score: 0,
            hearts: 3,
          },
        ];
      case 'collaborative':
        return [
          {
            id: 'player1',
            name: 'Player 1',
            score: 0,
            hearts: 3,
          },
          {
            id: 'player2',
            name: 'Player 2',
            score: 0,
            hearts: 3,
          },
        ];
      default:
        throw new Error(`Unsupported game mode: ${gameMode}`);
    }
  };

  // Effect to initialize the game or join an existing session
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (existingSessionId) {
      joinExistingSession();
    } else {
      initializeNewGame();
    }
  }, [
    isAuthenticated,
    existingSessionId,
    joinExistingSession,
    initializeNewGame,
  ]);

  // Poll for players in competitive mode
  useEffect(() => {
    if (!waitingForPlayers || !sessionId || mode !== 'competitive') {
      return;
    }

    const checkPlayers = async () => {
      try {
        const status = await gameService.getSessionStatus(sessionId);
        console.log('Session status:', status);

        // Check if we have enough players (2 for competitive)
        if (status.playerCount >= 2) {
          console.log('All players joined, closing invite modal');
          setShowInviteModal(false);
          setWaitingForPlayers(false);

          // Update players with the joined players
          const playerStates = convertPlayersData(status.players);
          setPlayers(playerStates);
        }
      } catch (error) {
        console.error('Failed to check session status:', error);
      }
    };

    // Check immediately
    checkPlayers();

    // Then check every 2 seconds
    const interval = setInterval(checkPlayers, 2000);

    return () => clearInterval(interval);
  }, [waitingForPlayers, sessionId, mode, convertPlayersData]);

  const handleGameEnd = async (_result: GameResult) => {
    // Complete the game session but don't navigate yet
    if (sessionId) {
      try {
        const gameResult = await gameService.completeSession(
          parseInt(sessionId)
        );
        console.log('Game completed:', gameResult);

        // Store the game result for potential use but don't navigate
        // Navigation will happen when user clicks the button
      } catch (err) {
        console.error('Failed to complete game session:', err);
      }
    }
  };

  const handleQuit = () => {
    // Don't show confirmation if game is already finished
    // Navigate back to topic/quiz
    if (topicId) {
      navigate(`/topics/${topicId}`);
    } else {
      navigate('/topics');
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null; // The hook will handle redirection
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-white py-8">
        <h1 className="text-2xl font-bold mb-4">Fehler</h1>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={() => navigate('/game-modes')}
          className="text-[#FCC822] hover:underline"
        >
          Zurück zu den Spielmodi
        </button>
      </div>
    );
  }

  if ((!mode && !existingSessionId) || !questions.length || !sessionId) {
    return (
      <div className="text-center text-white py-8">
        <h1 className="text-2xl font-bold mb-4">Fehler</h1>
        <p className="text-gray-300 mb-4">
          Die Spielinformationen konnten nicht geladen werden.
        </p>
        <button
          onClick={() => navigate('/game-modes')}
          className="text-[#FCC822] hover:underline"
        >
          Zurück zu den Spielmodi
        </button>
      </div>
    );
  }

  return (
    <>
      <GameProvider
        sessionId={sessionId}
        initialPlayers={sessionMeta?.players || []}
        initialSessionMeta={sessionMeta}
      >
        <QuizGameContainer
          mode={
            mode ||
            (sessionMeta?.mode === 'comp'
              ? 'competitive'
              : sessionMeta?.mode === 'collab'
                ? 'collaborative'
                : 'solo')
          }
          topicTitle={title}
          questions={questions}
          players={players}
          onGameEnd={handleGameEnd}
          onQuit={handleQuit}
        />
      </GameProvider>

      {showInviteModal && sessionId && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-[#FCC822] text-4xl mb-2">🎮</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Multiplayer-Spiel erstellt!
              </h2>
              <p className="text-gray-300">
                Teile diesen Link mit deinem Gegner, um das Spiel zu starten.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Einladungslink
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={`${window.location.origin}/join/${sessionId}`}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-l-lg bg-gray-900 text-white border-r-0 border border-gray-700 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/join/${sessionId}`
                    );
                  }}
                  className="px-4 py-2 rounded-r-lg font-medium bg-[#FCC822] hover:bg-[#e0b01d] text-gray-900"
                >
                  Kopieren
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setWaitingForPlayers(false);
                }}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Spiel starten
              </button>

              <div className="text-gray-400 text-sm flex items-center">
                <span>Warte auf Mitspieler...</span>
                <div className="ml-2 w-4 h-4 rounded-full border-2 border-t-transparent border-[#FCC822] animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
