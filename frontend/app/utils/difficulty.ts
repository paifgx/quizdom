import type { QuizDifficulty } from '../types/quiz';

export function getDifficultyName(
  difficulty: QuizDifficulty | string | number
): string {
  // Handle numeric difficulties (new format)
  if (typeof difficulty === 'number') {
    switch (difficulty) {
      case 1:
        return '1 - Anfänger';
      case 2:
        return '2 - Lehrling';
      case 3:
        return '3 - Geselle';
      case 4:
        return '4 - Meister';
      case 5:
        return '5 - Großmeister';
      default:
        return `${difficulty}`;
    }
  }

  // Handle string difficulties (old format, for backwards compatibility)
  if (typeof difficulty === 'string') {
    switch (difficulty) {
      case 'easy':
        return '1 - Anfänger';
      case 'medium':
        return '3 - Geselle';
      case 'hard':
        return '5 - Großmeister';
      default:
        return difficulty;
    }
  }

  return `${difficulty}`;
}

export function mapStringToNumericDifficulty(
  difficulty: string
): QuizDifficulty {
  switch (difficulty) {
    case 'easy':
      return 1;
    case 'medium':
      return 3;
    case 'hard':
      return 5;
    default:
      return 1;
  }
}

export function mapNumericToStringDifficulty(
  difficulty: QuizDifficulty
): string {
  switch (difficulty) {
    case 1:
      return 'easy';
    case 2:
      return 'easy';
    case 3:
      return 'medium';
    case 4:
      return 'hard';
    case 5:
      return 'hard';
    default:
      return 'easy';
  }
}
