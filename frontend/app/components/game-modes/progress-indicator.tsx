import React from 'react';
import type { GameStep } from '../../types/game';

interface ProgressIndicatorProps {
  currentStep: GameStep;
  showProgress: boolean;
}

/**
 * Displays the progress indicator for the two-step game mode selection flow.
 * Shows current step and provides visual feedback for user navigation.
 * Only renders when progress should be shown (not in pre-selected topic flow).
 *
 * @param props - Component props
 * @param props.currentStep - The current step in the selection process
 * @param props.showProgress - Whether to show the progress indicator
 */
export function ProgressIndicator({
  currentStep,
  showProgress,
}: ProgressIndicatorProps) {
  if (!showProgress) return null;

  return (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-4">
        <StepIndicator
          step={1}
          label="Mode"
          isActive={currentStep === 'mode'}
        />
        <StepSeparator />
        <StepIndicator
          step={2}
          label="Topic"
          isActive={currentStep === 'topic'}
        />
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  step: number;
  label: string;
  isActive: boolean;
}

/**
 * Renders an individual step indicator with number and label.
 * Provides visual differentiation between active and inactive steps.
 */
function StepIndicator({ step, label, isActive }: StepIndicatorProps) {
  return (
    <div
      className={`flex items-center space-x-2 ${
        isActive ? 'text-[#FCC822]' : 'text-gray-400'
      }`}
    >
      <StepNumber step={step} isActive={isActive} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

interface StepNumberProps {
  step: number;
  isActive: boolean;
}

/**
 * Renders the step number badge with active/inactive styling.
 */
function StepNumber({ step, isActive }: StepNumberProps) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isActive ? 'bg-[#FCC822] text-gray-900' : 'bg-gray-600 text-gray-300'
      }`}
    >
      {step}
    </div>
  );
}

/**
 * Renders the separator line between step indicators.
 */
function StepSeparator() {
  return <div className="w-8 h-0.5 bg-gray-600"></div>;
}
