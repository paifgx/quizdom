/**
 * Quiz game route that handles the actual gameplay.
 * Supports all three game modes with proper state management.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { QuizGameContainer } from '../components/game';
import { LoadingSpinner } from '../components/home/loading-spinner';
import type { Question, PlayerState, GameResult } from '../types/game';

export function meta() {
  return [
    { title: 'Quiz Game | Quizdom' },
    {
      name: 'description',
      content: 'Play the quiz game in your chosen mode.',
    },
  ];
}

// Mock function to get questions
async function getQuestions(_topicId: string): Promise<Question[]> {
  // In a real app, this would fetch from the backend
  return [
    {
      id: 'q1',
      text: 'What is the capital of France?',
      answers: ['Berlin', 'Paris', 'Madrid', 'Lisbon'],
      correctAnswer: 1,
      showTimestamp: 0, // Will be set when question is shown
    },
    {
      id: 'q2',
      text: 'What is 2 + 2?',
      answers: ['3', '4', '5', '6'],
      correctAnswer: 1,
      showTimestamp: 0,
    },
    {
      id: 'q3',
      text: 'Which planet is known as the Red Planet?',
      answers: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 1,
      showTimestamp: 0,
    },
    {
      id: 'q4',
      text: 'What is the largest ocean on Earth?',
      answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      correctAnswer: 3,
      showTimestamp: 0,
    },
    {
      id: 'q5',
      text: 'Who painted the Mona Lisa?',
      answers: ['Van Gogh', 'Picasso', 'Da Vinci', 'Rembrandt'],
      correctAnswer: 2,
      showTimestamp: 0,
    },
  ];
}

export default function QuizGamePage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode') as
    | 'solo'
    | 'competitive'
    | 'collaborative';
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [topicTitle, setTopicTitle] = useState('');

  useEffect(() => {
    const initializeGame = async () => {
      if (!topicId || !mode) {
        navigate('/game-modes');
        return;
      }

      try {
        // Get questions
        const gameQuestions = await getQuestions(topicId);
        setQuestions(gameQuestions);

        // Set topic title (in real app, fetch from API)
        setTopicTitle('IT-Projektmanagement');

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

        // Create game session (mock for now)
        // await createGameSession(mode, topicId, players.map(p => p.id));

        setLoading(false);
      } catch {
        // Failed to initialize game
        navigate('/game-modes');
      }
    };

    initializeGame();
  }, [topicId, mode, navigate]);

  const handleGameEnd = (_result: GameResult) => {
    // Game ended - in a real app, save the result to the backend
    // TODO: Implement result saving logic
  };

  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit the game?')) {
      navigate(`/topics/${topicId}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!mode || !questions.length) {
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
    <QuizGameContainer
      mode={mode}
      topicTitle={topicTitle}
      questions={questions}
      players={players}
      onGameEnd={handleGameEnd}
      onQuit={handleQuit}
    />
  );
}
