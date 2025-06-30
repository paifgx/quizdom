/**
 * Quiz game route that handles the actual gameplay.
 * Supports all three game modes with proper state management.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { QuizGameContainer } from '../components/game';
import { LoadingSpinner } from '../components/home/loading-spinner';
import { gameService } from '../services/game';
import { GameProvider } from '../contexts/GameContext';
import { useAuthenticatedGame } from '../hooks/useAuthenticatedGame';
import type { Question, PlayerState, GameResult, GameModeId } from '../types/game';

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
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticatedGame();

  const mode = searchParams.get('mode') as GameModeId | null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    const initializeGame = async () => {
      if (!topicId || !mode) {
        navigate('/game-modes');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Start a new game session
        const sessionResponse = await gameService.startTopicGame(
          topicId,
          mode,
          10 // number of questions
        );

        setSessionId(sessionResponse.session_id);
        setTopicTitle(sessionResponse.topic_title || 'Quiz Game');

        // Load all questions for the session
        const questionsData = await gameService.getAllQuestionsForSession(
          sessionResponse.session_id,
          sessionResponse.total_questions
        );

        // Convert backend questions to frontend format
        const convertedQuestions: Question[] = questionsData.map((q) => ({
          id: q.question_id.toString(),
          text: q.content,
          answers: q.answers.map(a => a.content),
          correctAnswer: -1, // Will be revealed after answering
          showTimestamp: q.show_timestamp,
          // Store answer IDs for submission
          answerIds: q.answers.map(a => a.id),
        }));

        setQuestions(convertedQuestions);

        // Initialize players based on mode
        if (mode === 'solo') {
          setPlayers([
            {
              id: 'player1',
              name: 'You',
              score: 0,
              hearts: 3,
              avatar: '/avatars/player_male_with_greataxe.png',
            },
          ]);
        } else if (mode === 'competitive') {
          setPlayers([
            {
              id: 'player1',
              name: 'ALEX',
              score: 0,
              hearts: 3,
              avatar: '/avatars/player_male_with_greataxe.png',
            },
            {
              id: 'player2',
              name: 'SOPHIA',
              score: 0,
              hearts: 3,
              avatar: '/avatars/player_female_sword_magic.png',
            },
          ]);
        } else if (mode === 'collaborative') {
          setPlayers([
            {
              id: 'player1',
              name: 'ALEX',
              score: 0,
              hearts: 0, // Hearts are tracked at team level
              avatar: '/avatars/player_male_with_greataxe.png',
            },
            {
              id: 'player2',
              name: 'SOPHIA',
              score: 0,
              hearts: 0,
              avatar: '/avatars/player_female_sword_magic.png',
            },
          ]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError(err instanceof Error ? err.message : 'Failed to start game');
        setLoading(false);
      }
    };

    initializeGame();
  }, [topicId, mode, navigate]);

  const handleGameEnd = async (_result: GameResult) => {
    // Complete the game session
    if (sessionId) {
      try {
        const gameResult = await gameService.completeSession(sessionId);
        console.log('Game completed:', gameResult);
        
        // Navigate to results page or topic page
        // TODO: Create a results page to show detailed stats
        navigate(`/topics/${topicId}`, {
          state: {
            gameCompleted: true,
            finalScore: gameResult.final_score,
            correctAnswers: gameResult.correct_answers,
            totalQuestions: gameResult.questions_answered,
          },
        });
      } catch (err) {
        console.error('Failed to complete game session:', err);
        // Still navigate even if completion fails
        navigate(`/topics/${topicId}`);
      }
    }
  };

  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit the game?')) {
      // TODO: Consider marking session as abandoned
      navigate(`/topics/${topicId}`);
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
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={() => navigate('/game-modes')}
          className="text-[#FCC822] hover:underline"
        >
          Back to Game Modes
        </button>
      </div>
    );
  }

  if (!mode || !questions.length || !sessionId) {
    return (
      <div className="text-center text-white py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-300 mb-4">Unable to load game data.</p>
        <button
          onClick={() => navigate('/game-modes')}
          className="text-[#FCC822] hover:underline"
        >
          Back to Game Modes
        </button>
      </div>
    );
  }

  return (
    <GameProvider sessionId={sessionId}>
      <QuizGameContainer
        mode={mode}
        topicTitle={topicTitle}
        questions={questions}
        players={players}
        onGameEnd={handleGameEnd}
        onQuit={handleQuit}
      />
    </GameProvider>
  );
}
