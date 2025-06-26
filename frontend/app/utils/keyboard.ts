import type { KeyboardEvent } from 'react';

/**
 * Keyboard event handling utilities.
 *
 * Provides consistent keyboard interaction patterns across components.
 * Handles accessibility and user experience for key-based actions.
 */

/**
 * Common keyboard keys for UI interactions.
 *
 * Centralizes key code constants for consistent behavior.
 * Improves maintainability of keyboard event handling.
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
} as const;

/**
 * Handles keyboard events for actionable elements.
 * Triggers the provided action when Enter or Space keys are pressed.
 *
 * @param e - The keyboard event
 * @param action - The action to execute
 */
export function handleKeyDown(e: KeyboardEvent, action: () => void): void {
  if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
    e.preventDefault();
    action();
  }
}
