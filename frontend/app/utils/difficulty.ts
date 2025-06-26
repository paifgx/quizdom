import type { QuizDifficulty } from '../types/quiz';

// ---------------------------------------------------------------------------
// Central difficulty helpers (numeric ranks 1-5 ←→ Anzeige)
// ---------------------------------------------------------------------------

export const DIFFICULTY_NAMES: Record<QuizDifficulty, string> = {
  1: 'Anfänger',
  2: 'Lehrling',
  3: 'Geselle',
  4: 'Meister',
  5: 'Großmeister',
};

export const DIFFICULTY_COLORS: Record<QuizDifficulty, string> = {
  1: 'bg-green-600 text-green-100',
  2: 'bg-blue-600 text-blue-100',
  3: 'bg-yellow-600 text-yellow-100',
  4: 'bg-orange-600 text-orange-100',
  5: 'bg-red-600 text-red-100',
};

/**
 * Returns the display name of the difficulty rank.
 */
export function getDifficultyName(difficulty: QuizDifficulty | number): string {
  return DIFFICULTY_NAMES[difficulty as QuizDifficulty] ?? `${difficulty}`;
}

/**
 * Returns Tailwind-CSS classes for badge colors.
 */
export function getDifficultyColor(
  difficulty: QuizDifficulty | number
): string {
  return (
    DIFFICULTY_COLORS[difficulty as QuizDifficulty] ??
    'bg-gray-600 text-gray-100'
  );
}
