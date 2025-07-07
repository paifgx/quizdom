/**
 * Game modes selection page component.
 * Orchestrates the flow: mode selection → quiz selection → game start.
 * Follows clean code principles with proper separation of concerns.
 */
import { ProtectedRoute } from '../components/auth/protected-route';
import { PageHeader } from '../components/game-modes/page-header';
import { ProgressIndicator } from '../components/game-modes/progress-indicator';
import { LiveRegion } from '../components/game-modes/live-region';
import { GameModeSelection } from '../components/game-modes/game-mode-selection';
import { TopicSelection } from '../components/game-modes/topic-selection';
import { AllQuizzesSelection } from '../components/game-modes/all-quizzes-selection';
import { ActionButtons } from '../components/game-modes/action-buttons';
import { HelpText } from '../components/game-modes/help-text';
import { useGameModeSelection } from '../hooks/useGameModeSelection';
import { topicsService } from '../services/api';
import { gameModes } from '../api/data';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Topic, GameModeId } from '../types/game';

export function meta() {
  return [
    { title: 'Game Modes | Quizdom' },
    {
      name: 'description',
      content: 'Choose from different exciting game modes.',
    },
  ];
}

/**
 * Main game modes selection page.
 * Provides a clean, accessible interface for selecting game mode and quiz.
 * Uses extracted components and custom hook for state management.
 *
 * Game modes are hardcoded since they contain logic and UI behavior,
 * while quizzes are fetched dynamically as they represent user data.
 *
 * Features:
 * - Direct quiz selection after choosing mode
 * - Shows all available quizzes from all topics
 * - Support for pre-selected topics via URL parameters
 * - Full accessibility support with ARIA attributes and live regions
 * - Error handling and validation
 * - Responsive design
 */
export default function GameModesPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<GameModeId | null>(null);
  const [showAllQuizzes, setShowAllQuizzes] = useState(false);

  // Load topics data on component mount using real backend API
  // Game modes are hardcoded and imported directly
  useEffect(() => {
    const loadTopics = async () => {
      try {
        // Use the real API service instead of mock data
        const topicsData = await topicsService.getAll();
        console.log('Loaded topics from backend:', topicsData);
        setTopics(topicsData);
      } catch (error) {
        console.error('Failed to load topics from backend:', error);
        // Set empty array to avoid undefined
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  const {
    currentStep,
    selectedMode: hookSelectedMode,
    selectedTopicId,
    preSelectedTopic,
    liveRegionText,
    canStart,
    handleModeSelect: originalHandleModeSelect,
    handleTopicSelect,
    handleStart: _originalHandleStart,
    handleBack,
    handleNextStep,
  } = useGameModeSelection({ topics });

  const selectedModeData = selectedMode
    ? (gameModes.find(m => m.id === selectedMode) ?? null)
    : null;

  // Override mode selection to show quiz selection immediately
  const handleModeSelect = (modeId: GameModeId) => {
    if (modeId === 'competitive') {
      navigate('/duell');
      return;
    }
    setSelectedMode(modeId);
    setShowAllQuizzes(true);
  };

  // Handle quiz selection
  const handleSelectQuiz = (quizId: number) => {
    // Navigate to quiz game with the specific quiz ID
    navigate(`/quiz/${quizId}/quiz-game?mode=${selectedMode}`);
  };

  const handleBackFromQuizSelection = () => {
    setShowAllQuizzes(false);
    setSelectedMode(null);
  };

  // Show loading state while topics are loading
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
            <p className="text-gray-300">Loading game modes...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If we're showing quiz selection
  if (showAllQuizzes && selectedMode) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AllQuizzesSelection
            selectedMode={selectedMode}
            topics={topics}
            onSelectQuiz={handleSelectQuiz}
            onBack={handleBackFromQuizSelection}
          />
        </div>
      </ProtectedRoute>
    );
  }

  // Otherwise show the regular flow (for backward compatibility with preselected topics)
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          currentStep={currentStep}
          selectedModeData={
            selectedModeData ||
            (hookSelectedMode
              ? (gameModes.find(m => m.id === hookSelectedMode) ?? null)
              : null)
          }
          preSelectedTopic={preSelectedTopic}
        />

        <ProgressIndicator
          currentStep={currentStep}
          showProgress={!preSelectedTopic}
        />

        <LiveRegion text={liveRegionText} />

        {currentStep === 'mode' && (
          <GameModeSelection
            gameModes={gameModes}
            selectedMode={hookSelectedMode}
            onModeSelect={
              preSelectedTopic ? originalHandleModeSelect : handleModeSelect
            }
          />
        )}

        {currentStep === 'topic' && (
          <TopicSelection
            topics={topics}
            selectedTopicId={selectedTopicId}
            selectedModeData={
              selectedModeData ||
              (hookSelectedMode
                ? (gameModes.find(m => m.id === hookSelectedMode) ?? null)
                : null)
            }
            onTopicSelect={handleTopicSelect}
          />
        )}

        <ActionButtons
          currentStep={currentStep}
          preSelectedTopic={preSelectedTopic}
          selectedMode={hookSelectedMode}
          canStart={canStart}
          onStart={_originalHandleStart}
          onNext={handleNextStep}
          onBack={handleBack}
        />

        <HelpText selectedMode={hookSelectedMode} />
      </div>
    </ProtectedRoute>
  );
}
