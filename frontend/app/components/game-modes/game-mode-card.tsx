import React from 'react';
import type { GameMode } from '../../types/game';
import { handleKeyDown } from '../../utils/keyboard';

interface GameModeCardProps {
  mode: GameMode;
  isSelected: boolean;
  onSelect: (modeId: GameMode['id']) => void;
}

/**
 * Displays a selectable game mode card with hover effects and accessibility support.
 * Handles visual feedback for selection state and keyboard interactions.
 * Follows accessibility best practices with proper ARIA attributes.
 *
 * @param props - Component props
 * @param props.mode - The game mode data to display
 * @param props.isSelected - Whether this mode is currently selected
 * @param props.onSelect - Callback function when mode is selected
 */
export function GameModeCard({
  mode,
  isSelected,
  onSelect,
}: GameModeCardProps) {
  const handleSelect = () => onSelect(mode.id);

  return (
    <div
      className={`group relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
        isSelected ? 'scale-105' : ''
      }`}
      onClick={handleSelect}
      onKeyDown={e => handleKeyDown(e, handleSelect)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${mode.name} game mode`}
    >
      <div
        className={`bg-gray-800/70 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
          isSelected
            ? 'border-[#FCC822] shadow-lg shadow-[#FCC822]/25'
            : 'border-gray-600 hover:border-[#FCC822]/50'
        }`}
      >
        <ModeImage mode={mode} />
        <ModeTitle mode={mode} />
        {isSelected && <SelectionIndicator />}
      </div>
    </div>
  );
}

interface ModeImageProps {
  mode: GameMode;
}

/**
 * Renders the mode image with hover overlay and fallback handling.
 */
function ModeImage({ mode }: ModeImageProps) {
  return (
    <div className="relative h-64 sm:h-72 lg:h-80 xl:h-96 w-full">
      <img
        src={mode.icon}
        alt={mode.name}
        className="w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
        onError={e => {
          e.currentTarget.src = '/buttons/Play.png';
        }}
      />

      <HoverOverlay mode={mode} />
    </div>
  );
}

interface HoverOverlayProps {
  mode: GameMode;
}

/**
 * Renders the hover description overlay for the mode card.
 */
function HoverOverlay({ mode }: HoverOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
      <div className="text-center p-4">
        <p className="text-white text-sm font-medium leading-relaxed">
          {mode.description}
        </p>
      </div>
    </div>
  );
}

interface ModeTitleProps {
  mode: GameMode;
}

/**
 * Renders the mode title section.
 */
function ModeTitle({ mode }: ModeTitleProps) {
  return (
    <div className="p-8 text-center">
      <h3 className="text-2xl font-bold text-[#FCC822] mb-2">{mode.name}</h3>
    </div>
  );
}

/**
 * Renders the selection indicator icon.
 */
function SelectionIndicator() {
  return (
    <div className="absolute top-4 right-4 bg-[#FCC822] text-gray-900 rounded-full p-2">
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
