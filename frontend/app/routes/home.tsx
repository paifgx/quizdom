import type { Route } from './+types/home';
import { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/auth';
import { LandingPage } from '../components/landing-page';
import { Dashboard } from '../components/dashboard';
import { HomeLoading } from '../components/ui/home-loading';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Quizdom - Rise of the Wise' },
    {
      name: 'description',
      content: 'Welcome to Quizdom - Das ultimative Quiz-Erlebnis!',
    },
  ];
}

// Mock data for topics
const availableTopics = [
  {
    id: 'it-project-management',
    title: 'IT-PROJEKT-MANAGEMENT',
    image: '/topics/IT-projectmanagement.png',
    description: 'Projektmanagement in der IT-Welt',
  },
  {
    id: 'math',
    title: 'MATHE',
    image: '/topics/Math.png',
    description: 'Mathematische Grundlagen und fortgeschrittene Konzepte',
  },
];

// Mock data for online users
const onlineUsers = [
  {
    id: '1',
    username: 'Player1',
    avatar: '/avatars/player_male_with_greataxe.png',
  },
  {
    id: '2',
    username: 'WizardMaster',
    avatar: '/avatars/ai_assistant_wizard.png',
  },
  {
    id: '3',
    username: 'SwordQueen',
    avatar: '/avatars/player_female_sword_magic.png',
  },
  {
    id: '4',
    username: 'Player4',
    avatar: '/avatars/player_male_with_greataxe.png',
  },
  {
    id: '5',
    username: 'Player5',
    avatar: '/avatars/player_female_sword_magic.png',
  },
];

// Mock data for recent achievements
const recentAchievements = [
  { id: '1', title: 'First Quiz', badge: '/badges/badge_book_1.png' },
  { id: '2', title: 'Quiz Master', badge: '/badges/badge_book_2.png' },
];

/**
 * Home route component that renders different views based on authentication state
 * Acts as a container component managing data and logic
 */
export default function HomePage() {
  const { isAuthenticated, isViewingAsAdmin, user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return <HomeLoading />;
  }

  if (isAuthenticated && isViewingAsAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const filteredTopics = availableTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  if (isAuthenticated) {
    return (
      <Dashboard
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        topics={availableTopics}
        filteredTopics={filteredTopics}
        onlineUsers={onlineUsers}
        achievements={recentAchievements}
        user={user}
      />
    );
  }

  return <LandingPage />;
}
