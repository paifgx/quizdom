/**
 * Game modes selection page component.
 * Orchestrates the two-step flow: mode selection → topic selection → game start.
 * Follows clean code principles with proper separation of concerns.
 */
import React from 'react';
import { ProtectedRoute } from '../components/auth/protected-route';
import { PageHeader } from '../components/game-modes/page-header';
import { ProgressIndicator } from '../components/game-modes/progress-indicator';
import { LiveRegion } from '../components/game-modes/live-region';
import { GameModeSelection } from '../components/game-modes/game-mode-selection';
import { TopicSelection } from '../components/game-modes/topic-selection';
import { ActionButtons } from '../components/game-modes/action-buttons';
import { HelpText } from '../components/game-modes/help-text';
import { useGameModeSelection } from '../hooks/useGameModeSelection';
import { gameModes, topics } from '../data/game-data';

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
 * Features:
 * - Two-step selection flow (mode → topic)
 * - Support for pre-selected topics via URL parameters
 * - Full accessibility support with ARIA attributes and live regions
 * - Error handling and validation
 * - Responsive design
 */
export default function GameModesPage() {
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
