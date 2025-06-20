import type { GameStep, GameModeId, Topic } from '../../types/game';
import { translate } from '../../utils/translations';

interface ActionButtonsProps {
  currentStep: GameStep;
  preSelectedTopic: Topic | null;
  selectedMode: GameModeId | null;
  canStart: boolean;
  onStart: () => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Renders the action buttons for the game mode selection interface.
 * Handles different button states based on current step and selections.
 * Provides appropriate feedback for disabled states.
 *
 * @param props - Component props
 * @param props.currentStep - Current step in the selection process
 * @param props.preSelectedTopic - Pre-selected topic from URL parameters
 * @param props.selectedMode - Currently selected game mode
 * @param props.canStart - Whether the game can be started
 * @param props.onStart - Callback to start the game
 * @param props.onNext - Callback to proceed to next step
 * @param props.onBack - Callback to go back
 */
export function ActionButtons({
  currentStep,
  preSelectedTopic,
  selectedMode,
  canStart,
  onStart,
  onNext,
  onBack,
}: ActionButtonsProps) {
  const showStartButton = shouldShowStartButton(
    currentStep,
    preSelectedTopic,
    selectedMode,
    canStart
  );
  const showNextButton = shouldShowNextButton(
    currentStep,
    selectedMode,
    preSelectedTopic
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {showStartButton && (
        <StartButton
          canStart={canStart}
          preSelectedTopic={preSelectedTopic}
          onStart={onStart}
        />
      )}
      {showNextButton && <NextButton onNext={onNext} />}
      <BackButton onBack={onBack} />
    </div>
  );
}

interface StartButtonProps {
  canStart: boolean;
  preSelectedTopic: Topic | null;
  onStart: () => void;
}

/**
 * Renders the start/play button with appropriate styling and disabled state.
 */
function StartButton({
  canStart,
  preSelectedTopic,
  onStart,
}: StartButtonProps) {
  const buttonText = preSelectedTopic ? 'Play' : 'Start Game';
  const disabledTitle = !canStart
    ? 'Please select a game mode and topic'
    : undefined;

  return (
    <button
      onClick={onStart}
      disabled={!canStart}
      className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
        !canStart
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-[#FCC822] to-[#e6b41f] text-gray-900 hover:from-[#e6b41f] hover:to-[#d1a01c] transform hover:scale-105'
      }`}
      title={disabledTitle}
      aria-label={`${buttonText} ${disabledTitle ? '(disabled)' : ''}`}
    >
      {buttonText}
    </button>
  );
}

interface NextButtonProps {
  onNext: () => void;
}

/**
 * Renders the next step button.
 */
function NextButton({ onNext }: NextButtonProps) {
  return (
    <button
      onClick={onNext}
      className="px-8 py-3 bg-gradient-to-r from-[#FCC822] to-[#e6b41f] text-gray-900 rounded-lg font-bold text-lg hover:from-[#e6b41f] hover:to-[#d1a01c] transform hover:scale-105 transition-all duration-200"
      aria-label={translate('nextButton.ariaLabel')}
    >
      {translate('nextButton.ariaLabel')}
    </button>
  );
}

interface BackButtonProps {
  onBack: () => void;
}

/**
 * Renders the back button.
 */
function BackButton({ onBack }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
      aria-label={translate('accessibility.back')}
    >
      {translate('accessibility.back')}
    </button>
  );
}

/**
 * Determines whether to show the start button based on current state.
 */
function shouldShowStartButton(
  currentStep: GameStep,
  preSelectedTopic: Topic | null,
  selectedMode: GameModeId | null,
  canStart: boolean
): boolean {
  return (
    (currentStep === 'mode' && Boolean(preSelectedTopic && selectedMode)) ||
    (currentStep === 'topic' && canStart)
  );
}

/**
 * Determines whether to show the next button based on current state.
 */
function shouldShowNextButton(
  currentStep: GameStep,
  selectedMode: GameModeId | null,
  preSelectedTopic: Topic | null
): boolean {
  return currentStep === 'mode' && Boolean(selectedMode) && !preSelectedTopic;
}
