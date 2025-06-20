/**
 * Topics data configuration.
 * Contains all topic information with English content following language consistency rules.
 * Includes categories and difficulty mappings for filtering functionality.
 */

import type { Topic, DifficultyLevel } from '../types/topics';

export const categories = [
  'Science',
  'History',
  'Geography',
  'Sports',
  'Art & Culture',
  'Technology',
  'Nature',
  'Mathematics',
];

export const difficultyNames: DifficultyLevel[] = [
  'Anfänger',
  'Lehrling',
  'Geselle',
  'Meister',
  'Großmeister',
];

export const topics: Topic[] = [
  {
    id: 'it-project-management',
    title: 'IT Project Management',
    description:
      'Comprehensive questions about IT project management, methodologies, and best practices.',
    category: 'Technology',
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
    title: 'Mathematics',
    description:
      'Mathematical fundamentals and advanced concepts for all learning levels.',
    category: 'Mathematics',
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
    title: 'Physics',
    description: 'Physics fundamentals - from mechanics to quantum physics.',
    category: 'Science',
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
    title: 'World History',
    description: 'Important events and personalities in world history.',
    category: 'History',
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
    title: 'Geography',
    description: 'Countries, capitals, rivers and geographical features.',
    category: 'Geography',
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
    title: 'Art & Culture',
    description: 'Masterpieces of art history and cultural developments.',
    category: 'Art & Culture',
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
