/**
 * Centralized data store for the Quizdom application.
 * Contains all application data in one place to simulate external API data.
 * All user-facing content is in German following the application's localization requirements.
 */

import type { GameMode, Topic as GameTopic } from '../types/game';
import type { Topic, DifficultyLevel } from '../types/topics';
import type { TopicDetailData, Achievement } from '../types/topic-detail';

// ============================================================================
// STATIC REFERENCE DATA
// ============================================================================

/**
 * Available categories for topic filtering.
 */
export const categories = [
  'Wissenschaft',
  'Geschichte',
  'Geographie',
  'Sport',
  'Kunst & Kultur',
  'Technologie',
  'Natur',
  'Mathematik',
];

/**
 * Fantasy-themed difficulty names based on star ratings.
 */
export const difficultyNames: DifficultyLevel[] = [
  'Anfänger',
  'Lehrling',
  'Geselle',
  'Meister',
  'Großmeister',
];

/**
 * Difficulty name mapping for star ratings.
 */
export const difficultyNameMap: Record<number, string> = {
  1: 'Anfänger',
  2: 'Lehrling',
  3: 'Geselle',
  4: 'Meister',
  5: 'Großmeister',
};

// ============================================================================
// GAME MODES DATA
// ============================================================================

/**
 * Available game modes for quiz gameplay.
 */
export const gameModes: GameMode[] = [
  {
    id: 'solo',
    name: 'Solo Quiz',
    description:
      'Spiele in deinem eigenen Tempo und verbessere dein Wissen. Perfekt zum Lernen und zur Selbsteinschätzung.',
    icon: '/playmodi/solo.png',
  },
  {
    id: 'duel',
    name: 'Duell',
    description:
      'Fordere einen anderen Spieler in Echtzeit-Wettbewerb heraus. Schnell und aufregend!',
    icon: '/playmodi/competitive.png',
  },
  {
    id: 'team',
    name: 'Team Battle',
    description:
      'Schließe dich mit Teamkollegen zusammen, um gegen andere anzutreten. Arbeite zusammen und entwickle Strategien.',
    icon: '/playmodi/collaborative.png',
  },
];

// ============================================================================
// TOPICS DATA
// ============================================================================

/**
 * Game topics used in game mode selection.
 */
export const gameTopics: GameTopic[] = [
  {
    id: 'it-projectmanagement',
    title: 'IT-Projektmanagement',
    totalQuestions: 150,
    image: '/topics/it-project-management.png',
    description:
      'Umfassende Fragen zum IT-Projektmanagement, Methodologien und bewährten Praktiken.',
  },
  {
    id: 'math',
    title: 'Mathematik',
    totalQuestions: 100,
    image: '/topics/math.png',
    description:
      'Mathematische Grundlagen und fortgeschrittene Konzepte für alle Lernstufen.',
  },
  {
    id: 'physics',
    title: 'Physik',
    totalQuestions: 120,
    image: '/topics/physics.png',
    description: 'Physik-Grundlagen - von Mechanik bis Quantenphysik.',
  },
  {
    id: 'world-history',
    title: 'Weltgeschichte',
    totalQuestions: 200,
    image: '/topics/history.png',
    description: 'Wichtige Ereignisse und Persönlichkeiten der Weltgeschichte.',
  },
  {
    id: 'geography',
    title: 'Geographie',
    totalQuestions: 80,
    image: '/topics/geography.png',
    description: 'Länder, Hauptstädte, Flüsse und geographische Merkmale.',
  },
  {
    id: 'art-culture',
    title: 'Kunst & Kultur',
    totalQuestions: 90,
    image: '/topics/art.png',
    description:
      'Meisterwerke der Kunstgeschichte und kulturelle Entwicklungen.',
  },
];

/**
 * Home page topics for dashboard display.
 */
export const homeTopics = [
  {
    id: 'it-project-management',
    title: 'IT-Projektmanagement',
    image: '/topics/it-project-management.png',
    description: 'Projektmanagement in der IT-Welt und bewährte Praktiken.',
  },
  {
    id: 'math',
    title: 'Mathematik',
    image: '/topics/math.png',
    description:
      'Mathematische Grundlagen und fortgeschrittene Konzepte für alle Lernstufen.',
  },
];

/**
 * Full topics data for topics page with complete metadata.
 */
export const topics: Topic[] = [
  {
    id: 'it-project-management',
    title: 'IT-Projektmanagement',
    description:
      'Umfassende Fragen zum IT-Projektmanagement, Methodologien und bewährten Praktiken.',
    category: 'Technologie',
    totalQuestions: 150,
    completedQuestions: 10,
    image: '/topics/it-project-management.png',
    stars: 2, // Medium difficulty
    popularity: 85,
    wisecoinReward: 200,
    isCompleted: false,
    isFavorite: true,
  },
  {
    id: 'mathematics',
    title: 'Mathematik',
    description:
      'Mathematische Grundlagen und fortgeschrittene Konzepte für alle Lernstufen.',
    category: 'Mathematik',
    totalQuestions: 100,
    completedQuestions: 0,
    image: '/topics/math.png',
    stars: 4, // Hard difficulty
    popularity: 92,
    wisecoinReward: 250,
    isCompleted: false,
    isFavorite: false,
  },
  {
    id: 'physics',
    title: 'Physik',
    description: 'Physik-Grundlagen - von Mechanik bis Quantenphysik.',
    category: 'Wissenschaft',
    totalQuestions: 120,
    completedQuestions: 85,
    image: '/topics/physics.png',
    stars: 3, // Medium difficulty
    popularity: 88,
    wisecoinReward: 180,
    isCompleted: false,
    isFavorite: true,
  },
  {
    id: 'world-history',
    title: 'Weltgeschichte',
    description: 'Wichtige Ereignisse und Persönlichkeiten der Weltgeschichte.',
    category: 'Geschichte',
    totalQuestions: 200,
    completedQuestions: 200,
    image: '/topics/history.png',
    stars: 2, // Medium difficulty
    popularity: 90,
    wisecoinReward: 300,
    isCompleted: true,
    isFavorite: false,
  },
  {
    id: 'geography',
    title: 'Geographie',
    description: 'Länder, Hauptstädte, Flüsse und geographische Merkmale.',
    category: 'Geographie',
    totalQuestions: 80,
    completedQuestions: 45,
    image: '/topics/geography.png',
    stars: 1, // Easy difficulty
    popularity: 95,
    wisecoinReward: 150,
    isCompleted: false,
    isFavorite: false,
  },
  {
    id: 'art-culture',
    title: 'Kunst & Kultur',
    description:
      'Meisterwerke der Kunstgeschichte und kulturelle Entwicklungen.',
    category: 'Kunst & Kultur',
    totalQuestions: 90,
    completedQuestions: 15,
    image: '/topics/art.png',
    stars: 5, // Hard difficulty
    popularity: 71,
    wisecoinReward: 220,
    isCompleted: false,
    isFavorite: false,
  },
];

// ============================================================================
// ACHIEVEMENTS DATA
// ============================================================================

/**
 * Sample achievements for topic detail display.
 */
export const sampleAchievements: Achievement[] = [
  {
    id: 'first-steps',
    name: 'Erste Schritte',
    image: '/badges/badge_1_64x64.png',
    isUnlocked: true,
  },
  {
    id: 'quick-learner',
    name: 'Schneller Lerner',
    image: '/badges/badge_2_64x64.png',
    isUnlocked: false,
  },
  {
    id: 'knowledge-master',
    name: 'Wissensmeister',
    image: '/badges/badge_3_64x64.png',
    isUnlocked: false,
  },
  {
    id: 'bookworm-1',
    name: 'Bücherwurm I',
    image: '/badges/badge_book_1.png',
    isUnlocked: true,
  },
  {
    id: 'bookworm-2',
    name: 'Bücherwurm II',
    image: '/badges/badge_book_2.png',
    isUnlocked: false,
  },
];

// ============================================================================
// TOPIC DETAIL DATA
// ============================================================================

/**
 * Mock topic detail data for development and testing.
 */
export const topicDetailData: Record<string, TopicDetailData> = {
  'it-project-management': {
    id: 'it-project-management',
    title: 'IT-Projektmanagement',
    description:
      'Umfassende Fragen zum IT-Projektmanagement, Methodologien und bewährten Praktiken. Lerne über agile, waterfall und hybride Ansätze.',
    image: '/topics/it-project-management.png',
    totalQuestions: 150,
    completedQuestions: 10,
    bookmarkedQuestions: 2,
    stars: 2, // Medium difficulty
    questions: [
      {
        id: '1',
        number: 1,
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'easy',
      },
      {
        id: '2',
        number: 2,
        isBookmarked: true,
        isCompleted: false,
        difficulty: 'medium',
      },
      {
        id: '3',
        number: 3,
        isBookmarked: false,
        isCompleted: false,
        difficulty: 'hard',
      },
    ],
    isFavorite: true,
    wisecoinReward: 200,
  },
  mathematics: {
    id: 'mathematics',
    title: 'Mathematik',
    description:
      'Mathematische Grundlagen und fortgeschrittene Konzepte für alle Lernstufen. Von grundlegender Arithmetik bis zu komplexer Analysis.',
    image: '/topics/math.png',
    totalQuestions: 100,
    completedQuestions: 0,
    bookmarkedQuestions: 0,
    stars: 4, // Hard difficulty
    questions: [],
    isFavorite: false,
    wisecoinReward: 250,
  },
  physics: {
    id: 'physics',
    title: 'Physik',
    description:
      'Erkunde die fundamentalen Gesetze der Natur durch interaktive Fragen über Mechanik, Thermodynamik und Quantenphysik.',
    image: '/topics/physics.png',
    totalQuestions: 120,
    completedQuestions: 25,
    bookmarkedQuestions: 5,
    stars: 3, // Medium difficulty
    questions: [
      {
        id: '1',
        number: 1,
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'easy',
      },
      {
        id: '2',
        number: 2,
        isBookmarked: false,
        isCompleted: true,
        difficulty: 'medium',
      },
    ],
    isFavorite: true,
    wisecoinReward: 180,
  },
  history: {
    id: 'history',
    title: 'Geschichte',
    description:
      'Reise durch die Zeit mit Fragen über antike Zivilisationen, Weltkriege und historische Ereignisse, die unsere Welt geprägt haben.',
    image: '/topics/history.png',
    totalQuestions: 200,
    completedQuestions: 50,
    bookmarkedQuestions: 8,
    stars: 1, // Easy difficulty
    questions: [
      {
        id: '1',
        number: 1,
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'easy',
      },
    ],
    isFavorite: false,
    wisecoinReward: 150,
  },
};
