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

      // If this is a competitive or collaborative game, redirect to lobby
      if (mode === 'competitive' || mode === 'collaborative') {
        navigate(`/lobby/${sessionIdStr}`);
        return;
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
          topicId={topicId}
          quizId={quizId}
          questions={questions}
          players={players}
          onGameEnd={handleGameEnd}
          onQuit={handleQuit}
        />
      </GameProvider>
    </>
  );
}
