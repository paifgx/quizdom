/**
 * Game modes selection page component.
 * Orchestrates the two-step flow: mode selection → topic selection → game start.
 * Follows clean code principles with proper separation of concerns.
 */
import { ProtectedRoute } from '../components/auth/protected-route';
import { PageHeader } from '../components/game-modes/page-header';
import { ProgressIndicator } from '../components/game-modes/progress-indicator';
import { LiveRegion } from '../components/game-modes/live-region';
import { GameModeSelection } from '../components/game-modes/game-mode-selection';
import { TopicSelection } from '../components/game-modes/topic-selection';
import { ActionButtons } from '../components/game-modes/action-buttons';
import { HelpText } from '../components/game-modes/help-text';
import { useGameModeSelection } from '../hooks/useGameModeSelection';
import { fetchGameTopics } from '../api';
import { gameModes } from '../api/data';
import { useEffect, useState } from 'react';
import type { Topic } from '../types/game';

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
 * Provides a clean, accessible interface for selecting game mode and topic.
 * Uses extracted components and custom hook for state management.
 *
 * Game modes are hardcoded since they contain logic and UI behavior,
 * while topics are fetched dynamically as they represent user data.
 *
 * Features:
 * - Two-step selection flow (mode → topic)
 * - Support for pre-selected topics via URL parameters
 * - Full accessibility support with ARIA attributes and live regions
 * - Error handling and validation
 * - Responsive design
 */
export default function GameModesPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Load topics data on component mount
  // Game modes are hardcoded and imported directly
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const topicsData = await fetchGameTopics();
        setTopics(topicsData);
      } catch {
        // Error intentionally ignored
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  const {
    currentStep,
    selectedMode,
    selectedTopicId,
    preSelectedTopic,
    liveRegionText,
    canStart,
    handleModeSelect,
    handleTopicSelect,
    handleStart,
    handleBack,
    handleNextStep,
  } = useGameModeSelection({ topics });

  const selectedModeData = selectedMode
    ? (gameModes.find(m => m.id === selectedMode) ?? null)
    : null;

  // Show loading state while topics are loading, especially important for preselected topics
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

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          currentStep={currentStep}
          selectedModeData={selectedModeData}
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
            selectedMode={selectedMode}
            onModeSelect={handleModeSelect}
          />
        )}

        {currentStep === 'topic' && (
          <TopicSelection
            topics={topics}
            selectedTopicId={selectedTopicId}
            selectedModeData={selectedModeData}
            onTopicSelect={handleTopicSelect}
          />
        )}

        <ActionButtons
          currentStep={currentStep}
          preSelectedTopic={preSelectedTopic}
          selectedMode={selectedMode}
          canStart={canStart}
          onStart={handleStart}
          onNext={handleNextStep}
          onBack={handleBack}
        />

        <HelpText selectedMode={selectedMode} />
      </div>
    </ProtectedRoute>
  );
}
