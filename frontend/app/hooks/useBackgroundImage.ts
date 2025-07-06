import { useLocation, useSearchParams } from 'react-router';
import { useBackground } from '../contexts/background';
import { useEffect } from 'react';
import type { GameModeId } from '../types/game';

/**
 * Configuration for route-specific backgrounds
 */
const routeBackgrounds: Record<string, string> = {
  '/': '/background/background_pink.png',
  '/quizzes': '/background/background_orange.png',
  '/topics': '/background/background_day.png',
  '/game-modes': '/background/background_day.png',
  '/progress': '/background/background_pink.png',
  '/profile': '/background/background_orange.png',
  '/admin/dashboard': '/background/backgroud_night.png',
  '/admin/questions': '/background/backgroud_night.png',
  '/admin/users': '/background/backgroud_night.png',
  '/admin/logs': '/background/backgroud_night.png',
  '/quiz': '/background/background_orange.png',
};

/**
 * Get background image URL based on current route and game mode
 */
function getBackgroundForRoute(
  pathname: string,
  gameMode?: GameModeId | null
): string {
  // Special handling for quiz game routes - use background based on game mode
  if (pathname.includes('/quiz-game')) {
    if (gameMode === 'solo') {
      return '/background/backgroud_night.png';
    } else if (gameMode === 'competitive') {
      return '/background/background_day.png';
    } else if (gameMode === 'collaborative') {
      return '/background/background_orange.png';
    }
    // Fallback to orange for unknown modes
    return '/background/background_orange.png';
  }

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
  const [searchParams] = useSearchParams();
  const { backgroundImage, setBackgroundImage, resetToDefault } =
    useBackground();

  // Get game mode from URL parameters
  const gameMode = searchParams.get('mode') as GameModeId | null;

  // Automatically set background based on route and game mode when location changes
  useEffect(() => {
    const routeBackground = getBackgroundForRoute(location.pathname, gameMode);
    setBackgroundImage(routeBackground);
  }, [location.pathname, gameMode, setBackgroundImage]);

  return {
    backgroundImage,
    setBackgroundImage,
    resetToDefault,
    /**
     * Set background to the default for current route
     */
    setToRouteDefault: () => {
      const routeBackground = getBackgroundForRoute(
        location.pathname,
        gameMode
      );
      setBackgroundImage(routeBackground);
    },
  };
}
