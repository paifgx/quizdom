import React from 'react';
import { NineSlicePanel } from './nine-slice-panel';

export interface QuizButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}

/**
 * Renders an interactive quiz answer button with pixel-art styling
 */
export function QuizButton({ 
  text, 
  onClick, 
  disabled = false, 
  selected = false 
}: QuizButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  const getButtonClasses = () => {
    let classes = 'min-h-[60px] cursor-pointer transition-all duration-150';
    
    if (disabled) {
      classes += ' opacity-60 cursor-not-allowed grayscale-[0.5]';
    } else {
      classes += ' hover:brightness-110 hover:-translate-y-px active:translate-y-px active:brightness-90';
    }
    
    classes += ' focus:outline-2 focus:outline-[#fce9a5] focus:outline-offset-2';
    
    return classes;
  };

  return (
    <div 
      className={getButtonClasses()}
      onClick={handleClick}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <NineSlicePanel selected={selected}>
        <p className="text-[10px] p-3 font-bold">{text}</p>
      </NineSlicePanel>
    </div>
  );
} 