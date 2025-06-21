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
import { useGameState } from '../../hooks/useGameState';
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

  const { gameState, currentQuestion, timeRemaining, startGame, handleAnswer } =
    useGameState({
      mode,
      questions,
      players,
      onGameOver: result => {
        setGameResult(result);
        setShowResult(true);
        onGameEnd(result);

        // Save bookmarked questions to localStorage
        if (bookmarkedQuestions.size > 0) {
          const bookmarks = Array.from(bookmarkedQuestions);
          localStorage.setItem(
            `bookmarked_${topicTitle}`,
            JSON.stringify(bookmarks)
          );
        }
      },
    });

  // Load bookmarked questions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`bookmarked_${topicTitle}`);
    if (stored) {
      setBookmarkedQuestions(new Set(JSON.parse(stored)));
    }
  }, [topicTitle]);

  // Start game on mount
  useEffect(() => {
    startGame();
  }, [startGame]);

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
        onGoBack={onQuit}
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

  const isBookmarked = currentQuestion
    ? bookmarkedQuestions.has(currentQuestion.id)
    : false;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Game Header - Compact and Clean */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          {/* Top Row - Title, Progress, Quit */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg md:text-xl font-bold text-[#FCC822]">
              {topicTitle} - {mode.toUpperCase()}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-white font-medium text-sm md:text-base">
                Frage {gameState.currentQuestionIndex + 1}/{questions.length}
              </span>
              <button
                onClick={onQuit}
                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                title="Quiz beenden (ESC)"
              >
                <span className="hidden sm:inline">Beenden</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Timer */}
          <TimerBar
            timeRemaining={timeRemaining}
            timeLimit={gameState.timeLimit}
            className="mb-2"
          />

          {/* Game Stats - Compact */}
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
          <div className="flex items-center justify-center gap-8">
            {/* Character Display - Left Side */}
            {mode === 'solo' && (
              <div className="flex-shrink-0">
                <div className="text-center flex flex-col items-center gap-8">
                  <ScoreDisplay score={gameState.players[0].score} />
                  <img
                    src="/avatars/player_male_with_greataxe.png"
                    alt="Dein Charakter"
                    className="h-32 md:h-40 lg:h-48 w-auto"
                  />
                  <HeartsDisplay
                    hearts={gameState.players[0].hearts}
                    maxHearts={3}
                  />
                </div>
              </div>
            )}

            {mode === 'competitive' && (
              <div className="flex-shrink-0">
                <div className="text-center flex flex-col items-center gap-8">
                  <ScoreDisplay score={gameState.players[0].score} />
                  <img
                    src="/avatars/player_male_with_greataxe.png"
                    alt="Alex"
                    className="h-24 md:h-32 w-auto"
                  />
                  <HeartsDisplay
                    hearts={gameState.players[0].hearts}
                    maxHearts={3}
                  />
                </div>
              </div>
            )}

            {/* Quiz Content - Centered */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-4xl">
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
                  />

                  {/* Bookmark button - Pixel Art Style */}
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
              <div className="flex-shrink-0">
                <div className="text-center flex flex-col items-center gap-8">
                  <ScoreDisplay score={gameState.players[1].score} />
                  <img
                    src="/avatars/player_female_sword_magic.png"
                    alt="Sophia"
                    className="h-24 md:h-32 w-auto"
                  />
                  <HeartsDisplay
                    hearts={gameState.players[1].hearts}
                    maxHearts={3}
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
