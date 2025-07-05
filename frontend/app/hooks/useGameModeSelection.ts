import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import type { GameModeId, GameStep, Topic } from '../types/game';

interface UseGameModeSelectionOptions {
  topics: Topic[];
}

interface UseGameModeSelectionReturn {
  // State
  currentStep: GameStep;
  selectedMode: GameModeId | null;
  selectedTopicId: string | null;
  selectedTopic: Topic | null;
  preSelectedTopic: Topic | null;
  liveRegionText: string;
  canStart: boolean;

  // Actions
  handleModeSelect: (modeId: GameModeId) => void;
  handleTopicSelect: (topicId: string) => void;
  handleStart: () => void;
  handleBack: () => void;
  handleNextStep: () => void;
}

/**
 * Custom hook for managing game mode and topic selection state.
 * Handles navigation flow between mode selection and topic selection steps.
 * Provides validation and error handling for game configuration.
 *
 * @param options - Configuration options including available topics
 * @returns Object containing state and action handlers
 */
export function useGameModeSelection({
  topics,
}: UseGameModeSelectionOptions): UseGameModeSelectionReturn {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse pre-selected topic from URL parameters
  const preSelectedTopicId = searchParams.get('topic');
  const preSelectedTopic = preSelectedTopicId
    ? (topics.find(t => t.id === preSelectedTopicId) ?? null)
    : null;

  // Only validate preselected topic after topics have loaded
  // If topics array is empty, we're still loading, so don't validate yet
  if (preSelectedTopicId && topics.length > 0 && !preSelectedTopic) {
    throw new Error(
      `Topic with id "${preSelectedTopicId}" not found. Available topics: ${topics.map(t => t.id).join(', ')}`
    );
  }

  // State management
  const [currentStep, setCurrentStep] = useState<GameStep>(
    preSelectedTopic ? 'topic' : 'mode'
  );
  const [selectedMode, setSelectedMode] = useState<GameModeId | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    preSelectedTopicId
  );
  const [liveRegionText, setLiveRegionText] = useState('');

  // Ensure selectedTopicId is set when preSelectedTopic is available
  useEffect(() => {
    if (preSelectedTopicId && !selectedTopicId) {
      setSelectedTopicId(preSelectedTopicId);
    }
  }, [preSelectedTopicId, selectedTopicId]);

  // Derived state
  const selectedTopic = selectedTopicId
    ? (topics.find(t => t.id === selectedTopicId) ?? null)
    : null;

  const canStart = Boolean(
    selectedMode &&
      (selectedTopic || preSelectedTopic) &&
      (selectedTopic?.totalQuestions ?? preSelectedTopic?.totalQuestions ?? 0) >
        0
  );

  // Event handlers
  const handleModeSelect = useCallback(
    (modeId: GameModeId) => {
      setSelectedMode(modeId);
      setLiveRegionText(`${modeId} mode selected`);

      if (!preSelectedTopic) {
        setCurrentStep('topic');
      }
    },
    [preSelectedTopic]
  );

  const handleTopicSelect = useCallback(
    (topicId: string) => {
      const topic = topics.find(t => t.id === topicId);
      if (!topic) {
        throw new Error(`Topic with id "${topicId}" not found`);
      }

      setSelectedTopicId(topicId);
      setLiveRegionText(`Topic ${topic.title} selected`);
    },
    [topics]
  );

  const handleStart = useCallback(() => {
    if (!selectedMode) {
      throw new Error('No game mode selected');
    }

    const effectiveTopic = selectedTopic || preSelectedTopic;
    if (!effectiveTopic) {
      throw new Error('No topic selected');
    }
    if (effectiveTopic.totalQuestions === 0) {
      throw new Error('Selected topic has no questions available');
    }

    const topicIdToUse = selectedTopicId || preSelectedTopicId;
    navigate(`/topics/${topicIdToUse}/quiz-game?mode=${selectedMode}`);
  }, [
    selectedMode,
    selectedTopic,
    preSelectedTopic,
    selectedTopicId,
    preSelectedTopicId,
    navigate,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep === 'topic' && !preSelectedTopic) {
      setCurrentStep('mode');
    } else {
      navigate(-1);
    }
  }, [currentStep, preSelectedTopic, navigate]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 'mode' && selectedMode && !preSelectedTopic) {
      setCurrentStep('topic');
    }
  }, [currentStep, selectedMode, preSelectedTopic]);

  return {
    // State
    currentStep,
    selectedMode,
    selectedTopicId,
    selectedTopic,
    preSelectedTopic,
    liveRegionText,
    canStart,

    // Actions
    handleModeSelect,
    handleTopicSelect,
    handleStart,
    handleBack,
    handleNextStep,
  };
}
