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
      content: 'Willkommen bei Quizdom - Das ultimative Quiz-Erlebnis!',
    },
  ];
}

// Mock data for topics
const availableTopics = [
  {
    id: 'it-project-management',
    title: 'IT Project Management',
    image: '/topics/it-project-management.png',
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
  const { isAuthenticated, isViewingAsAdmin, loading } = useAuth();
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

  // Show loading state to prevent content flicker during authentication check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822]"></div>
      </div>
    );
  }

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
