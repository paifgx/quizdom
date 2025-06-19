import { useLocation } from 'react-router';
import { useBackground } from '../contexts/background';
import { useEffect } from 'react';

/**
 * Configuration for route-specific backgrounds
 */
const routeBackgrounds: Record<string, string> = {
  '/': '/background/background_pink.png',
  '/quizzes': '/background/background_orange.png',
  '/game-modes': '/background/background_day.png',
  '/progress': '/background/background_pink.png',
  '/profile': '/background/background_orange.png',
  '/admin/dashboard': '/background/backgroud_night.png',
  '/admin/questions': '/background/backgroud_night.png',
  '/admin/users': '/background/backgroud_night.png',
  '/admin/logs': '/background/backgroud_night.png',
};

/**
 * Get background image URL based on current route
 */
function getBackgroundForRoute(pathname: string): string {
  // Check for exact matches first
  if (routeBackgrounds[pathname]) {
    return routeBackgrounds[pathname];
  }
  
  // Check for route prefixes (for nested routes)
  for (const [route, background] of Object.entries(routeBackgrounds)) {
    if (pathname.startsWith(route) && route !== '/') {
      return background;
    }
  }
  
  // Default background
  return routeBackgrounds['/'] || '/background/background_pink.png';
}

/**
 * Hook that provides background image management
 * Automatically sets route-based backgrounds but allows manual overrides
 */
export function useBackgroundImage() {
  const location = useLocation();
  const { backgroundImage, setBackgroundImage, resetToDefault } = useBackground();
  
  // Automatically set background based on route when location changes
  useEffect(() => {
    const routeBackground = getBackgroundForRoute(location.pathname);
    setBackgroundImage(routeBackground);
  }, [location.pathname, setBackgroundImage]);

  return {
    backgroundImage,
    setBackgroundImage,
    resetToDefault,
    /**
     * Set background to the default for current route
     */
    setToRouteDefault: () => {
      const routeBackground = getBackgroundForRoute(location.pathname);
      setBackgroundImage(routeBackground);
    },
  };
} 