import type { GameStep, GameModeId, Topic } from '../../types/game';
import type { ReactNode } from 'react';
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

type ButtonVariant = 'primary' | 'secondary' | 'default';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  'aria-label': string;
  disabled?: boolean;
  title?: string;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#FCC822] to-[#e6b41f] text-gray-900 hover:from-[#e6b41f] hover:to-[#d1a01c] transform hover:scale-105',
  secondary: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
  default:
    'bg-gray-600 text-gray-400 cursor-not-allowed',
};

function Button({
  onClick,
  children,
  'aria-label': ariaLabel,
  disabled = false,
  title,
  variant = 'primary',
}: ButtonProps) {
  const buttonVariant = disabled ? 'default' : variant;
  const classes = `px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${variantClasses[buttonVariant]}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
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
  const showStartButton = canStart && (currentStep === 'mode' || currentStep === 'topic');
  const showNextButton = currentStep === 'mode' && !!selectedMode && !preSelectedTopic;

  const startButtonText = preSelectedTopic
    ? translate('actionButtons.play')
    : translate('actionButtons.startGame');

  const startButtonDisabledTitle = !canStart
    ? translate('actionButtons.disabledStartTitle')
    : undefined;

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {showStartButton && (
        <Button
          onClick={onStart}
          disabled={!canStart}
          title={startButtonDisabledTitle}
          aria-label={`${startButtonText} ${
            startButtonDisabledTitle ? '(disabled)' : ''
          }`}
        >
          {startButtonText}
        </Button>
      )}
      {showNextButton && (
        <Button
          onClick={onNext}
          aria-label={translate('nextButton.ariaLabel')}
        >
          {translate('nextButton.ariaLabel')}
        </Button>
      )}
      <Button
        onClick={onBack}
        variant="secondary"
        aria-label={translate('accessibility.back')}
      >
        {translate('accessibility.back')}
      </Button>
    </div>
  );
}
