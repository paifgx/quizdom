/**
 * Static game configuration data.
 * Contains game modes and topics with their metadata.
 * All content is in English following the language consistency rule.
 */

import type { GameMode, Topic } from '../types/game';

export const gameModes: GameMode[] = [
  {
    id: 'solo',
    name: 'Solo Quiz',
    description:
      'Play at your own pace and improve your knowledge. Perfect for learning and self-assessment.',
    icon: '/playmodi/solo.png',
  },
  {
    id: 'duel',
    name: 'Duel',
    description:
      'Challenge another player in real-time competition. Fast-paced and exciting!',
    icon: '/playmodi/competitive.png',
  },
  {
    id: 'team',
    name: 'Team Battle',
    description:
      'Join forces with teammates to compete against others. Collaborate and strategize together.',
    icon: '/playmodi/collaborative.png',
  },
];

export const topics: Topic[] = [
  {
    id: 'it-projectmanagement',
    title: 'IT Project Management',
    totalQuestions: 150,
    image: '/topics/it-project-management.png',
    description:
      'Comprehensive questions about IT project management, methodologies, and best practices.',
  },
  {
    id: 'math',
    title: 'Mathematics',
    totalQuestions: 100,
    image: '/topics/math.png',
    description:
      'Mathematical fundamentals and advanced concepts for all learning levels.',
  },
  {
    id: 'physics',
    title: 'Physics',
    totalQuestions: 120,
    image: '/topics/physics.png',
    description: 'Physics fundamentals - from mechanics to quantum physics.',
  },
  {
    id: 'world-history',
    title: 'World History',
    totalQuestions: 200,
    image: '/topics/history.png',
    description: 'Important events and personalities in world history.',
  },
  {
    id: 'geography',
    title: 'Geography',
    totalQuestions: 80,
    image: '/topics/geography.png',
    description: 'Countries, capitals, rivers and geographical features.',
  },
  {
    id: 'art-culture',
    title: 'Art & Culture',
    totalQuestions: 90,
    image: '/topics/art.png',
    description: 'Masterpieces of art history and cultural developments.',
  },
];
