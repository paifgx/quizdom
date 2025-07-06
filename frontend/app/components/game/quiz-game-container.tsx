/**
 * Main quiz game container component.
 * Integrates all game components and manages the overall game flow.
 */
import { useState, useEffect } from 'react';
import { type QuizData } from '../nine-slice-quiz';
import { TimerBar } from './timer-bar';
import { GameResultScreen } from './game-result';
import { useGameWithBackend } from '../../hooks/useGameWithBackend';
import { useGameContext } from '../../contexts/GameContext';
import type { GameResult, PlayerState, Question } from '../../types/game';
import { usePlayerDamage } from '../../hooks/usePlayerDamage';
import { PlayerCharacter } from './player-character';
import { CollaborativeStats } from './collaborative-stats';
import { CollaborativeCharacters } from './collaborative-characters';
import { QuizContent } from './quiz-content';

interface QuizGameContainerProps {
  mode: 'solo' | 'competitive' | 'collaborative';
  topicTitle: string;
  topicId?: string;
  quizId?: string;
  questions: Question[];
  players: PlayerState[];
  onGameEnd: (result: GameResult) => void;
  onQuit: () => void;
}

/**
 * Main quiz game container component.
 * Integrates all game components and manages the overall game flow.
 */
export function QuizGameContainer({
  mode,
  topicTitle,
  topicId,
  quizId,
  questions,
  players,
  onGameEnd,
  onQuit,
}: QuizGameContainerProps) {
  const { sessionId } = useGameContext();
  const { playerDamageStates, onHeartLoss } = usePlayerDamage(players);

  const handlePlayAgain = () => {
    window.location.reload();
  };

  const {
    gameState,
    currentQuestion,
    timeRemaining,
    startGame,
    handleAnswer,
    isSubmitting: _isSubmitting,
    waitingForOpponent,
  } = useGameWithBackend({
    mode,
    questions,
    players,
    sessionId: sessionId || '0',
    onGameOver: async (result: GameResult) => {
      setGameResult(result);
      onGameEnd(result);
      return Promise.resolve();
    },
    onHeartLoss,
  });

  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(
    undefined
  );
  const [isAnswerDisabled, setIsAnswerDisabled] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(
    new Set()
  );

  // In multiplayer modes, the backend determines which player is submitting based on auth token
  // We just need to pass any valid player ID for the frontend state management
  const currentPlayerId = players[0].id;

  useEffect(() => {
    if (gameState.status === 'waiting') {
      if (mode === 'competitive' || mode === 'collaborative') {
        return;
      }
      startGame();
    }
  }, [gameState.status, startGame, mode]);

  useEffect(() => {
    if (
      (mode === 'competitive' || mode === 'collaborative') &&
      gameState.status === 'waiting'
    ) {
      const checkPlayers = () => {
        if (gameState.players && gameState.players.length >= 2) {
          startGame();
        }
      };

      checkPlayers();

      const interval = setInterval(checkPlayers, 2000);
      return () => clearInterval(interval);
    }
  }, [mode, gameState.status, gameState.players, startGame]);

  useEffect(() => {
    if (gameState.status === 'finished' && gameResult) {
      setShowResult(true);
    }
  }, [gameState.status, gameResult]);

  useEffect(() => {
    const stored = localStorage.getItem(`bookmarked_${topicTitle}`);
    if (stored) {
      setBookmarkedQuestions(new Set(JSON.parse(stored)));
    }
  }, [topicTitle]);

  useEffect(() => {
    console.log('[QuizGameContainer] Question index changed:', gameState.currentQuestionIndex);
    setSelectedAnswer(undefined);
    setIsAnswerDisabled(false);
  }, [gameState.currentQuestionIndex]);

  const handleAnswerSelect = (answerId: string) => {
    if (isAnswerDisabled || gameState.status !== 'playing') {
      console.log('[QuizGameContainer] Answer disabled or game not playing', {
        isAnswerDisabled,
        gameStatus: gameState.status
      });
      return;
    }

    const answerIndex = parseInt(answerId);
    console.log('[QuizGameContainer] handleAnswerSelect called', {
      answerId,
      answerIndex,
      currentPlayerId,
      timestamp: Date.now()
    });

    setSelectedAnswer(answerIndex);
    setIsAnswerDisabled(true);

    // Call handleAnswer only once
    handleAnswer(currentPlayerId, answerIndex, Date.now());

    if (currentQuestion) {
      // Use topicId for topic games, quizId for quiz games
      const gameId = topicId || quizId;
      if (gameId) {
        const completedKey = `completed_${gameId}`;
        let completed: string[] = [];
        try {
          completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
        } catch {
          completed = [];
        }
        if (!completed.includes(currentQuestion.id)) {
          completed.push(currentQuestion.id);
          localStorage.setItem(completedKey, JSON.stringify(completed));
          console.log(
            '[QUIZ-GAME] Frage als beantwortet gespeichert:',
            completedKey,
            completed
          );
        } else {
          console.log(
            '[QUIZ-GAME] Frage war schon als beantwortet gespeichert:',
            completedKey,
            completed
          );
        }
      } else {
        console.log(
          '[QUIZ-GAME] Konnte topicId oder quizId nicht bestimmen:',
          { topicId, quizId, currentQuestion }
        );
      }
    } else {
      console.log(
        '[QUIZ-GAME] currentQuestion ist nicht verfügbar:',
        { topicId, quizId, currentQuestion }
      );
    }
  };

  const toggleBookmark = () => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });

    const bookmarkedQuestionsDataKey = `bookmarked_questions_data_${topicTitle}`;
    const existingData = localStorage.getItem(bookmarkedQuestionsDataKey);
    const existingQuestions = existingData ? JSON.parse(existingData) : {};

    const isCurrentlyBookmarked = bookmarkedQuestions.has(questionId);

    if (isCurrentlyBookmarked) {
      delete existingQuestions[questionId];
    } else {
      existingQuestions[questionId] = {
        id: currentQuestion.id,
        text: currentQuestion.text,
        answers: currentQuestion.answers,
        topicTitle: topicTitle,
        bookmarkedAt: new Date().toISOString(),
      };
    }

    localStorage.setItem(
      bookmarkedQuestionsDataKey,
      JSON.stringify(existingQuestions)
    );
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onQuit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onQuit]);

  useEffect(() => {
    if (bookmarkedQuestions.size > 0) {
      localStorage.setItem(
        `bookmarked_${topicTitle}`,
        JSON.stringify(Array.from(bookmarkedQuestions))
      );
    }
  }, [bookmarkedQuestions, topicTitle]);

  if (showResult && gameResult) {
    return (
      <GameResultScreen
        result={gameResult}
        onPlayAgain={handlePlayAgain}
        onGoBack={onQuit}
      />
    );
  }

  console.log('[QuizGameContainer] Current question:', {
    currentQuestionIndex: gameState.currentQuestionIndex,
    currentQuestion,
    hasQuestion: !!currentQuestion
  });

  const quizData: QuizData | null = currentQuestion
    ? {
        question: currentQuestion.text,
        answers: currentQuestion.answers.map((answer, index) => ({
          id: index.toString(),
          text: answer,
        })),
      }
    : null;

  const isBookmarked = currentQuestion
    ? bookmarkedQuestions.has(currentQuestion.id)
    : false;

  if (!quizData) {
    return <div>Lade Quiz...</div>;
  }

  return (
    <>
      <div className="relative min-h-screen text-white overflow-hidden">
        <div className="h-full flex flex-col px-4 py-8 pb-40 md:pb-8 lg:max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <button
                onClick={onQuit}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex flex-col">
                <h1 className="text-lg font-medium hidden md:block">
                  {topicTitle}
                </h1>
                <div className="text-sm text-[#FCC822] font-medium">
                  {mode === 'solo' && 'Solo Mission'}
                  {mode === 'competitive' && 'Duell'}
                  {mode === 'collaborative' && 'Team Battle'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">ESC =</span>
              <span className="text-white">Spiel beenden</span>
            </div>
            <div className="w-24" /> {/* Spacer for balance */}
          </div>

          {/* Timer Bar */}
          <div className="py-4">
            <TimerBar
              timeRemaining={timeRemaining}
              timeLimit={gameState.timeLimit}
            />
          </div>

          <div className="flex items-center justify-between flex-1">
            {/* Left Player (Competitive) or Spacer */}
            <div
              className={
                mode === 'solo'
                  ? 'w-1/3'
                  : 'w-32 lg:w-40 flex-shrink-0'
              }
            >
              {(mode === 'competitive' || mode === 'solo') &&
                gameState.players[0] && (
                  <PlayerCharacter
                    player={gameState.players[0]}
                    playerDamageStates={playerDamageStates}
                    avatarSrc="/avatars/player_male_with_greataxe.png"
                    alt={mode === 'solo' ? 'Dein Charakter' : 'Alex'}
                  />
                )}
            </div>

            {/* Middle Content (Quiz) */}
            <div className={mode === 'solo' ? 'w-2/3' : 'flex-1 max-w-4xl'}>
              {mode === 'collaborative' && (
                <CollaborativeStats gameState={gameState} />
              )}
              <QuizContent
                quizData={quizData}
                selectedAnswer={
                  selectedAnswer !== undefined
                    ? selectedAnswer.toString()
                    : undefined
                }
                onAnswerSelect={handleAnswerSelect}
                disabled={isAnswerDisabled}
                showCorrectAnswer={
                  isAnswerDisabled
                    ? {
                        correct: currentQuestion.correctAnswer,
                        selected: selectedAnswer,
                      }
                    : undefined
                }
                waitingForOpponent={
                  waitingForOpponent &&
                  (mode === 'competitive' || mode === 'collaborative')
                }
                isBookmarked={isBookmarked}
                onToggleBookmark={toggleBookmark}
                currentQuestion={currentQuestion}
              />
            </div>

            {/* Right Player (Competitive) or Spacer */}
            <div
              className={
                mode === 'solo'
                  ? 'hidden'
                  : 'w-32 lg:w-40 flex-shrink-0'
              }
            >
              {mode === 'competitive' && gameState.players[1] && (
                <PlayerCharacter
                  player={gameState.players[1]}
                  playerDamageStates={playerDamageStates}
                  avatarSrc="/avatars/player_female_sword_magic.png"
                  alt="Sophia"
                />
              )}
            </div>
          </div>

          {/* Collaborative mode characters below */}
          {mode === 'collaborative' && (
            <CollaborativeCharacters gameState={gameState} />
          )}
        </div>
      </div>

      {/* Waiting for opponent overlay */}
      {waitingForOpponent && mode === 'competitive' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Auf Mitspieler warten
            </h3>
            <p className="text-gray-400">
              Der andere Spieler wählt noch seine Antwort...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
