import React from 'react';

export interface AvatarPickerProps {
  value?: string;
  onChange: (avatarUrl: string) => void;
  className?: string;
}

/**
 * Avatar picker component for profile customization.
 *
 * Displays a grid of available avatars for user selection.
 * Highlights the currently selected avatar.
 */
export function AvatarPicker({ value, onChange, className = '' }: AvatarPickerProps) {
  const availableAvatars = [
    '/avatars/player_male_with_greataxe.png',
    '/avatars/player_female_with_sword.png',
    '/avatars/ai_assistant_wizard.png',
    '/avatars/player_male_with_bow.png',
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className}`}>
      {availableAvatars.map((avatar, index) => (
        <button
          key={avatar}
          type="button"
          onClick={() => onChange(avatar)}
          className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
            value === avatar
              ? 'border-[#FCC822] bg-[#FCC822] bg-opacity-20 scale-105'
              : 'border-gray-600 hover:border-[#FCC822]'
          }`}
          aria-label={`Select avatar ${index + 1}`}
        >
          <img
            src={avatar}
            alt={`Avatar ${index + 1}`}
            className="h-16 w-16 rounded-full mx-auto"
          />
        </button>
      ))}
    </div>
  );
}
