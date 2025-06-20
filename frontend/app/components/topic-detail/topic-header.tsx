/**
 * Topic header component displaying title and action buttons.
 * Provides favorite toggle and delete functionality with proper accessibility.
 */

import React from 'react';
import type { TopicHeaderProps } from '../../types/topic-detail';

/**
 * Displays the topic title with favorite and delete action buttons.
 * Handles user interactions for topic management.
 *
 * @param props - Component properties including topic data and callbacks
 * @returns JSX element for topic header
 */
export function TopicHeader({ topic, onToggleFavorite }: TopicHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="relative">
        <div className="w-full px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gray-800/80 border border-gray-600 rounded-xl backdrop-blur-sm flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-[#FCC822]">
            {topic.title}
          </h1>
          <div className="flex items-center space-x-2">
            <FavoriteButton
              isFavorite={topic.isFavorite}
              onToggle={onToggleFavorite}
            />
            <DeleteButton />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FavoriteButtonProps {
  /** Whether the topic is currently favorited */
  isFavorite: boolean;
  /** Callback for toggling favorite status */
  onToggle: () => void;
}

/**
 * Favorite button component with heart icon and toggle functionality.
 * Provides visual feedback for favorite status and accessibility features.
 *
 * @param props - Button properties including favorite status and toggle callback
 * @returns JSX element for favorite button
 */
function FavoriteButton({ isFavorite, onToggle }: FavoriteButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`h-5 w-5 transition-colors duration-200 ${
          isFavorite
            ? 'text-red-500 fill-current'
            : 'text-gray-400 hover:text-red-500'
        }`}
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

/**
 * Delete button component with trash icon.
 * Provides visual indication for topic deletion action.
 *
 * @returns JSX element for delete button
 */
function DeleteButton() {
  return (
    <button
      className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
      title="Delete topic"
      aria-label="Delete topic"
    >
      <img
        src="/buttons/Delete.png"
        alt="Delete"
        className="h-5 w-5"
        aria-hidden="true"
      />
    </button>
  );
}
