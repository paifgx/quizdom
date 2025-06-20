import React from 'react';

/**
 * Keyboard interaction utilities for accessibility.
 * Provides consistent keyboard event handling across components.
 */

/**
 * Handles keyboard events for actionable elements.
 * Triggers the provided action when Enter or Space keys are pressed.
 *
 * @param e - The keyboard event
 * @param action - The action to execute
 */
export function handleKeyDown(
  e: React.KeyboardEvent,
  action: () => void
): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    action();
  }
}
