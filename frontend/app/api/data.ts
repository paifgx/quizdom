/**
 * Centralized data store for the Quizdom application.
 * Contains all application data in one place to simulate external API data.
 * All user-facing content is in German following the application's localization requirements.
 */

import type { GameMode } from '../types/game';
import type { GameTopic, DifficultyLevel } from '../types/topics';
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
// COMPREHENSIVE TOPICS DATA - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Comprehensive topic data structure serving as single source of truth.
 * All other topic arrays are derived from this base data.
 */
interface ComprehensiveTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  totalQuestions: number;
  completedQuestions: number;
  bookmarkedQuestions?: number;
  image: string;
  stars: number;
  popularity: number;
  wisecoinReward: number;
  isCompleted: boolean;
  isFavorite: boolean;
  showOnHome?: boolean;
  questions?: Array<{
    id: string;
    number: number;
    title: string;
    isBookmarked: boolean;
    isCompleted: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}

/**
 * Master topics data - single source of truth for all topic information.
 */
const masterTopics: ComprehensiveTopic[] = [
  {
    id: 'it-project-management',
    title: 'IT-Projektmanagement',
    description:
      'Umfassende Fragen zum IT-Projektmanagement, Methodologien und bewährten Praktiken. Lerne über agile, waterfall und hybride Ansätze.',
    category: 'Technologie',
    totalQuestions: 150,
    completedQuestions: 10,
    bookmarkedQuestions: 2,
    image: '/topics/it-project-management.png',
    stars: 2,
    popularity: 85,
    wisecoinReward: 200,
    isCompleted: false,
    isFavorite: true,
    showOnHome: true,
    questions: [
      {
        id: '1',
        number: 1,
        title: 'Agile Grundlagen',
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'easy',
      },
      {
        id: '2',
        number: 2,
        title: 'Scrum Framework',
        isBookmarked: true,
        isCompleted: false,
        difficulty: 'medium',
      },
      {
        id: '3',
        number: 3,
        title: 'Waterfall Methodik',
        isBookmarked: false,
        isCompleted: false,
        difficulty: 'hard',
      },
      {
        id: '4',
        number: 4,
        title: 'DevOps Praktiken',
        isBookmarked: false,
        isCompleted: true,
        difficulty: 'medium',
      },
      {
        id: '5',
        number: 5,
        title: 'Kanban Boards',
        isBookmarked: false,
        isCompleted: false,
        difficulty: 'easy',
      },
    ],
  },
  {
    id: 'mathematics',
    title: 'Mathematik',
    description:
      'Mathematische Grundlagen und fortgeschrittene Konzepte für alle Lernstufen. Von grundlegender Arithmetik bis zu komplexer Analysis.',
    category: 'Mathematik',
    totalQuestions: 100,
    completedQuestions: 0,
    bookmarkedQuestions: 0,
    image: '/topics/math.png',
    stars: 4,
    popularity: 92,
    wisecoinReward: 250,
    isCompleted: false,
    isFavorite: false,
    showOnHome: true,
    questions: [],
  },
  {
    id: 'physics',
    title: 'Physik',
    description:
      'Erkunde die fundamentalen Gesetze der Natur durch interaktive Fragen über Mechanik, Thermodynamik und Quantenphysik.',
    category: 'Wissenschaft',
    totalQuestions: 120,
    completedQuestions: 25,
    bookmarkedQuestions: 5,
    image: '/topics/physics.png',
    stars: 3,
    popularity: 88,
    wisecoinReward: 180,
    isCompleted: false,
    isFavorite: true,
    showOnHome: false,
    questions: [
      {
        id: '1',
        number: 1,
        title: 'Newtonsche Gesetze',
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'easy',
      },
      {
        id: '2',
        number: 2,
        title: 'Thermodynamik Basics',
        isBookmarked: false,
        isCompleted: true,
        difficulty: 'medium',
      },
      {
        id: '3',
        number: 3,
        title: 'Quantenmechanik',
        isBookmarked: true,
        isCompleted: false,
        difficulty: 'hard',
      },
      {
        id: '4',
        number: 4,
        title: 'Elektromagnetismus',
        isBookmarked: true,
        isCompleted: true,
        difficulty: 'medium',
      },
      {
        id: '5',
        number: 5,
        title: 'Relativitätstheorie',
        isBookmarked: true,
        isCompleted: false,
        difficulty: 'hard',
      },
      {
        id: '6',
        number: 6,
        title: 'Wellenmechanik',
        isBookmarked: true,
        isCompleted: false,
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'world-history',
    title: 'Weltgeschichte',
    description:
      'Reise durch die Zeit mit Fragen über antike Zivilisationen, Weltkriege und historische Ereignisse, die unsere Welt geprägt haben.',
    category: 'Geschichte',
    totalQuestions: 200,
    completedQuestions: 50,
    bookmarkedQuestions: 8,
    image: '/topics/history.png',
    stars: 1,
    popularity: 90,
    wisecoinReward: 150,
    isCompleted: false,
    isFavorite: false,
    showOnHome: false,
  },
  {
    id: 'geography',
    title: 'Geographie',
    description:
      'Länder, Hauptstädte, Flüsse und geographische Merkmale der Welt entdecken.',
    category: 'Geographie',
    totalQuestions: 80,
    completedQuestions: 45,
    bookmarkedQuestions: 3,
    image: '/topics/geography.png',
    stars: 1,
    popularity: 95,
    wisecoinReward: 150,
    isCompleted: false,
    isFavorite: false,
    showOnHome: false,
  },
  {
    id: 'art-culture',
    title: 'Kunst & Kultur',
    description:
      'Meisterwerke der Kunstgeschichte und kulturelle Entwicklungen durch die Jahrhunderte.',
    category: 'Kunst & Kultur',
    totalQuestions: 90,
    completedQuestions: 15,
    bookmarkedQuestions: 1,
    image: '/topics/art.png',
    stars: 5,
    popularity: 71,
    wisecoinReward: 220,
    isCompleted: false,
    isFavorite: false,
    showOnHome: false,
  },
];

// ============================================================================
// MASTER DATA ACCESS AND MUTATION FUNCTIONS
// ============================================================================

/**
 * Exported master topics for API mutations.
 * Use updateMasterTopic() instead of direct mutations.
 */
export { masterTopics };

/**
 * Updates a topic in the master data source.
 * This ensures all derived data stays synchronized.
 */
export function updateMasterTopic(
  topicId: string,
  updates: Partial<ComprehensiveTopic>
): ComprehensiveTopic | null {
  const topicIndex = masterTopics.findIndex(topic => topic.id === topicId);
  if (topicIndex === -1) return null;

  masterTopics[topicIndex] = { ...masterTopics[topicIndex], ...updates };
  return masterTopics[topicIndex];
}

/**
 * Finds a topic in the master data source.
 */
export function findMasterTopic(topicId: string): ComprehensiveTopic | null {
  return masterTopics.find(topic => topic.id === topicId) || null;
}

// ============================================================================
// DERIVED DATA VIEWS
// ============================================================================

/**
 * Game topics used in game mode selection.
 * Derived from masterTopics with GameTopic interface.
 */
export function getGameTopics(): GameTopic[] {
  return masterTopics.map(topic => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    category: topic.category,
    totalQuestions: topic.totalQuestions,
    completedQuestions: topic.completedQuestions,
    image: topic.image,
    stars: topic.stars,
    popularity: topic.popularity,
    wisecoinReward: topic.wisecoinReward,
    isCompleted: topic.isCompleted,
    isFavorite: topic.isFavorite,
  }));
}

/**
 * Home page topics for dashboard display.
 * Derived from masterTopics, filtered by showOnHome flag.
 */
export function getHomeTopics() {
  return masterTopics
    .filter(topic => topic.showOnHome)
    .map(topic => ({
      id: topic.id,
      title: topic.title,
      image: topic.image,
      description: topic.description,
    }));
}

/**
 * Full topics data for topics page with complete metadata.
 * Derived from masterTopics with Topic interface.
 */
export function getTopics(): GameTopic[] {
  return masterTopics.map(topic => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    category: topic.category,
    totalQuestions: topic.totalQuestions,
    completedQuestions: topic.completedQuestions,
    image: topic.image,
    stars: topic.stars,
    popularity: topic.popularity,
    wisecoinReward: topic.wisecoinReward,
    isCompleted: topic.isCompleted,
    isFavorite: topic.isFavorite,
  }));
}

/**
 * Topic detail data for individual topic pages.
 * Derived from masterTopics with TopicDetailData interface.
 */
export function getTopicDetailData(): Record<string, TopicDetailData> {
  return Object.fromEntries(
    masterTopics.map(topic => [
      topic.id,
      {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        image: topic.image,
        totalQuestions: topic.totalQuestions,
        completedQuestions: topic.completedQuestions,
        bookmarkedQuestions: topic.bookmarkedQuestions || 0,
        stars: topic.stars,
        questions: topic.questions || [],
        isFavorite: topic.isFavorite,
        wisecoinReward: topic.wisecoinReward,
      },
    ])
  );
}

// Backward compatibility - export static versions for components that need them
export const gameTopics = getGameTopics();
export const homeTopics = getHomeTopics();
export const topics = getTopics();
export const topicDetailData = getTopicDetailData();

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
