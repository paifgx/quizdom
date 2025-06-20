import React from 'react';
import type { GameStep, GameMode, Topic } from '../../types/game';

interface PageHeaderProps {
  currentStep: GameStep;
  selectedModeData: GameMode | null;
  preSelectedTopic: Topic | null;
}

/**
 * Renders the page header with dynamic title and description.
 * Adapts content based on current step and selection state.
 * Displays pre-selected topic information when applicable.
 *
 * @param props - Component props
 * @param props.currentStep - Current step in the selection process
 * @param props.selectedModeData - Data for the currently selected game mode
 * @param props.preSelectedTopic - Pre-selected topic from URL parameters
 */
export function PageHeader({
  currentStep,
  selectedModeData,
  preSelectedTopic,
}: PageHeaderProps) {
  const title = currentStep === 'mode' ? 'Choose Game Mode' : 'Select Topic';
  const description = getStepDescription(currentStep, selectedModeData);

  return (
    <div className="text-center mb-6">
      <h1 className="text-4xl font-bold text-[#FCC822] mb-4">{title}</h1>
      <div className="text-gray-300 text-lg max-w-2xl mx-auto">
        <p>{description}</p>
        {preSelectedTopic && currentStep === 'mode' && (
          <PreSelectedTopicInfo topic={preSelectedTopic} />
        )}
      </div>
    </div>
  );
}

interface PreSelectedTopicInfoProps {
  topic: Topic;
}

/**
 * Renders information about the pre-selected topic.
 */
function PreSelectedTopicInfo({ topic }: PreSelectedTopicInfoProps) {
  return (
    <span className="block mt-2 text-sm text-[#FCC822]">
      Topic: {topic.title}
    </span>
  );
}

/**
 * Gets the appropriate description text for the current step.
 */
function getStepDescription(
  currentStep: GameStep,
  selectedModeData: GameMode | null
): string {
  if (currentStep === 'mode') {
    return 'Select your preferred game mode to get started.';
  }

  const modeName = selectedModeData?.name || 'game';
  return `Choose a topic for your ${modeName}.`;
}
