/**
 * Home page topics data.
 * Contains minimal topic information for dashboard display.
 * Uses English content following language consistency rules.
 */

export interface HomeTopic {
  id: string;
  title: string;
  image: string;
  description: string;
}

export const homeTopics: HomeTopic[] = [
  {
    id: 'it-project-management',
    title: 'IT Project Management',
    image: '/topics/it-project-management.png',
    description: 'Project management in the IT world and best practices.',
  },
  {
    id: 'math',
    title: 'Mathematics',
    image: '/topics/math.png',
    description:
      'Mathematical fundamentals and advanced concepts for all learning levels.',
  },
];
