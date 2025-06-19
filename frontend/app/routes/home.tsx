import type { Route } from './+types/home';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/auth';
import { LandingPage } from '../components/landing-page';
import { Dashboard } from '../components/dashboard';

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
    title: 'IT Project Management',
    image: '/topics/it-projectmanagement.png',
    description: 'Projektmanagement in der IT-Welt',
  },
  {
    id: 'math',
    title: 'Mathematics',
    image: '/topics/math.png',
    description: 'Mathematische Grundlagen und fortgeschrittene Konzepte',
  },
];

/**
 * Home route component that renders different views based on authentication state
 * Acts as a container component managing data and logic
 */
export default function HomePage() {
  const { isAuthenticated, isViewingAsAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Redirect admins viewing as admin to admin dashboard
  useEffect(() => {
    if (isAuthenticated && isViewingAsAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isViewingAsAdmin, navigate]);

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
      />
    );
  }

  return <LandingPage />;
}
