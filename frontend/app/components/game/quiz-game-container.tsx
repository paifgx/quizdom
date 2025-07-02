/**
 * Main quiz game container component.
 * Integrates all game components and manages the overall game flow.
 */
import React, { useState, useEffect } from 'react';
import { QuizContainer } from '../nine-slice-quiz';
import { TimerBar } from './timer-bar';
import { HeartsDisplay } from './hearts-display';
import { ScoreDisplay } from './score-display';
import { GameResultScreen } from './game-result';
import { CharacterDisplay } from './character-display';
import { ScreenEffects } from './screen-effects';
import { useGameWithBackend } from '../../hooks/useGameWithBackend';
import { useGameContext } from '../../contexts/GameContext';
import type { GameResult, PlayerState, Question } from '../../types/game';

interface QuizGameContainerProps {
  mode: 'solo' | 'competitive' | 'collaborative';
  topicTitle: string;
  questions: Question[];
  players: PlayerState[];
  onGameEnd: (result: GameResult) => void;
  onQuit: () => void;
}

export function QuizGameContainer({
  mode,
  topicTitle,
  questions,
  players,
  onGameEnd,
  onQuit,
}: QuizGameContainerProps) {
  // Get sessionId from context
  const { sessionId } = useGameContext();

  // Enhanced state for visual effects
  const [screenEffects, setScreenEffects] = useState({
    showDamageFlash: false,
    showScreenShake: false,
  });

  const [playerDamageStates, setPlayerDamageStates] = useState<{
    [playerId: string]: {
      hearts: number;
      previousHearts: number;
      onDamage: boolean;
    };
  }>({});

  // Initialize player damage states
  useEffect(() => {
    const initialStates: typeof playerDamageStates = {};
    players.forEach(player => {
      initialStates[player.id] = {
        hearts: player.hearts,
        previousHearts: player.hearts,
        onDamage: false,
      };
    });
    setPlayerDamageStates(initialStates);
  }, [players]);

  const handleHeartLoss = (playerId?: string) => {
    // Trigger screen effects
    setScreenEffects({
      showDamageFlash: true,
      showScreenShake: true,
    });

    // Update player damage state if specific player
    if (playerId) {
      setPlayerDamageStates(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          onDamage: true,
        },
      }));

      // Clear player damage flag
      setTimeout(() => {
        setPlayerDamageStates(prev => ({
          ...prev,
          [playerId]: {
            ...prev[playerId],
            onDamage: false,
          },
        }));
      }, 100);
    }
  };

  const handleScreenEffectComplete = () => {
    setScreenEffects({
      showDamageFlash: false,
      showScreenShake: false,
    });
  };

  // Use the backend-integrated game hook
  const {
    gameState,
    currentQuestion,
    timeRemaining,
    startGame,
    handleAnswer,
    isSubmitting: _isSubmitting,
    waitingForOpponent
  } =
    useGameWithBackend({
      mode,
      questions,
      players,
      sessionId: sessionId || "0",
      onGameOver: async (result: GameResult) => {
        setGameResult(result);
        onGameEnd(result);
        return Promise.resolve();
      },
      onHeartLoss: event => {
        handleHeartLoss(event.playerId);

        // Update player damage tracking
        if (event.playerId) {
          setPlayerDamageStates(prev => ({
            ...prev,
            [event.playerId!]: {
              hearts: event.heartsRemaining,
              previousHearts:
                prev[event.playerId!]?.hearts || event.heartsRemaining + 1,
              onDamage: false,
            },
          }));
        }
      },
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

  const currentPlayer = players[0]; // For solo mode, or current player in multiplayer

  useEffect(() => {
    if (gameState.status === 'waiting') {
      if (mode === 'competitive') {
        return;
      }
      startGame();
    }
  }, [gameState.status, startGame, mode]);

  useEffect(() => {
    if (mode === 'competitive' && gameState.status === 'waiting') {
      const checkPlayers = () => {
        if (gameState.players && gameState.players.length >= 2) {
          startGame();
        }
      };

      // Check immediately
      checkPlayers();

      // Then check periodically
      const interval = setInterval(checkPlayers, 2000);
      return () => clearInterval(interval);
    }
  }, [mode, gameState.status, gameState.players, startGame]);

  // Handle game over - result is already passed through onGameOver callback
  useEffect(() => {
    if (gameState.status === 'finished' && gameResult) {
      setShowResult(true);
    }
  }, [gameState.status, gameResult]);

  // Load bookmarked questions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`bookmarked_${topicTitle}`);
    if (stored) {
      setBookmarkedQuestions(new Set(JSON.parse(stored)));
    }
  }, [topicTitle]);

  // Reset answer selection on new question
  useEffect(() => {
    setSelectedAnswer(undefined);
    setIsAnswerDisabled(false);
  }, [gameState.currentQuestionIndex]);

  const handleAnswerSelect = (answerId: string) => {
    if (isAnswerDisabled || gameState.status !== 'playing') return;

    const answerIndex = parseInt(answerId);
    setSelectedAnswer(answerIndex);
    setIsAnswerDisabled(true);
    handleAnswer(currentPlayer.id, answerIndex, Date.now());
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
  };

  // ESC key handler to quit game
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onQuit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onQuit]);

  // Auto-scroll to quiz content on mount
  useEffect(() => {
    // Scroll down to hide navigation and focus on quiz
    setTimeout(() => {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }, 100);
  }, []);

  const isBookmarked = currentQuestion
    ? bookmarkedQuestions.has(currentQuestion.id)
    : false;

  if (showResult && gameResult) {
    return (
      <GameResultScreen
        result={gameResult}
        onPlayAgain={() => {
          // Reset game state and start new game
          setShowResult(false);
          setGameResult(null);
          window.location.reload(); // Simple reset for now
        }}
        onGoBack={() => {
          // Don't show confirmation when game is already finished
          // The navigation is handled by the parent component
          onQuit();
        }}
      />
    );
  }

  if (!currentQuestion) {
    return <div className="text-white text-center">Loading...</div>;
  }

  const quizData = {
    question: currentQuestion.text,
    answers: currentQuestion.answers.map((answer, index) => ({
      id: index.toString(),
      text: answer,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScreenEffects
        showDamageFlash={screenEffects.showDamageFlash}
        showScreenShake={screenEffects.showScreenShake}
        onEffectComplete={handleScreenEffectComplete}
      />

      {/* Header with Timer and Quit */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onQuit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors text-white"
            >
              <img src="/buttons/Home.png" alt="" className="w-5 h-5" />
              <span className="font-bold text-sm">QUIT</span>
            </button>
            <div className="text-center">
              <h1 className="text-[#FCC822] font-bold text-lg md:text-xl">
                {topicTitle}
              </h1>
              <p className="text-gray-400 text-sm">
                Question {gameState.currentQuestionIndex + 1} von{' '}
                {gameState.questions.length}
              </p>
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Stats moved to player display - keeping empty for layout balance */}
              {mode === 'collaborative' && (
                <>
                  <ScoreDisplay
                    score={gameState.teamScore || 0}
                    label="TEAM SCORE"
                  />
                  <HeartsDisplay
                    hearts={gameState.teamHearts || 0}
                    maxHearts={3}
                    isTeamHearts
                    onHeartLoss={() => handleHeartLoss()}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Quiz Content Area with Character - Fills remaining space and centers content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-7xl py-8">
          <div className="flex items-center justify-center gap-4 lg:gap-6">
            {/* Character Display - Left Side */}
            {mode === 'solo' && (
              <div className="flex-shrink-0">
                <div className="text-center flex flex-col items-center gap-8">
                  <ScoreDisplay score={gameState.players[0].score} />
                  <CharacterDisplay
                    src="/avatars/player_male_with_greataxe.png"
                    alt="Dein Charakter"
                    hearts={gameState.players[0].hearts}
                    previousHearts={
                      playerDamageStates[gameState.players[0].id]
                        ?.previousHearts
                    }
                    onDamage={
                      playerDamageStates[gameState.players[0].id]?.onDamage
                    }
                  />
                  <HeartsDisplay
                    hearts={gameState.players[0].hearts}
                    maxHearts={3}
                    onHeartLoss={() => handleHeartLoss(gameState.players[0].id)}
                  />
                </div>
              </div>
            )}

            {mode === 'competitive' && (
              <div className="flex-shrink-0 w-32 lg:w-40">
                <div className="text-center flex flex-col items-center gap-6">
                  <ScoreDisplay score={gameState.players[0].score} />
                  <CharacterDisplay
                    src="/avatars/player_male_with_greataxe.png"
                    alt="Alex"
                    className="h-full w-auto"
                    hearts={gameState.players[0].hearts}
                    previousHearts={
                      playerDamageStates[gameState.players[0].id]
                        ?.previousHearts
                    }
                    onDamage={
                      playerDamageStates[gameState.players[0].id]?.onDamage
                    }
                  />
                  <HeartsDisplay
                    hearts={gameState.players[0].hearts}
                    maxHearts={3}
                    onHeartLoss={() => handleHeartLoss(gameState.players[0].id)}
                  />
                </div>
              </div>
            )}

            {/* Quiz Content - Centered */}
            <div className="flex-1 max-w-4xl">
              <div className="relative">
                <QuizContainer
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
                  waitingForOpponent={waitingForOpponent && (mode === 'competitive' || mode === 'collaborative')}
                />

                <div className="py-4">
                  <button
                    onClick={toggleBookmark}
                    className={`absolute -top-10 right-0 px-3 py-1 rounded-lg transition-all flex items-center gap-2 ${
                      isBookmarked
                        ? 'bg-[#FCC822]/20 border-2 border-[#FCC822]'
                        : 'bg-gray-800/50 border-2 border-gray-600 hover:border-gray-500'
                    }`}
                    title={
                      isBookmarked ? 'Markierung entfernen' : 'Frage markieren'
                    }
                  >
                    <span
                      className={`text-xs font-bold ${
                        isBookmarked ? 'text-[#FCC822]' : 'text-gray-400'
                      }`}
                    >
                      {isBookmarked ? '★' : '☆'}
                    </span>
                    <span
                      className={`text-xs font-medium hidden sm:inline ${
                        isBookmarked ? 'text-[#FCC822]' : 'text-gray-400'
                      }`}
                    >
                      {isBookmarked ? 'Markiert' : 'Markieren'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right side character for competitive mode */}
            {mode === 'competitive' && (
              <div className="flex-shrink-0 w-32 lg:w-40">
                <div className="text-center flex flex-col items-center gap-6">
                  <ScoreDisplay score={gameState.players[1].score} />
                  <CharacterDisplay
                    src="/avatars/player_female_sword_magic.png"
                    alt="Sophia"
                    className="h-full w-auto"
                    hearts={gameState.players[1].hearts}
                    previousHearts={
                      playerDamageStates[gameState.players[1].id]
                        ?.previousHearts
                    }
                    onDamage={
                      playerDamageStates[gameState.players[1].id]?.onDamage
                    }
                  />
                  <HeartsDisplay
                    hearts={gameState.players[1].hearts}
                    maxHearts={3}
                    onHeartLoss={() => handleHeartLoss(gameState.players[1].id)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collaborative mode characters below */}
          {mode === 'collaborative' && (
            <div className="flex justify-center items-end gap-4 mt-8">
              <div className="text-center flex flex-col items-center gap-2">
                <img
                  src="/avatars/player_male_with_greataxe.png"
                  alt="Alex"
                  className="h-20 md:h-24 lg:h-28 w-auto"
                />
                <ScoreDisplay score={gameState.players[0].score} />
              </div>
              <div className="flex items-center mb-4">
                <span className="text-[#FCC822] text-base font-bold px-2">
                  TEAM
                </span>
              </div>
              <div className="text-center flex flex-col items-center gap-2">
                <img
                  src="/avatars/player_female_sword_magic.png"
                  alt="Sophia"
                  className="h-20 md:h-24 lg:h-28 w-auto"
                />
                <ScoreDisplay score={gameState.players[1].score} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
