/**
 * Hook for ensuring authentication before accessing game features.
 * Handles authentication check and login redirect if needed.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/auth';

export function useAuthenticatedGame() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        if (authService.isAuthenticated()) {
          // We have a token, but let's verify it's still valid
          try {
            await authService.getCurrentUser();
            setIsAuthenticated(true);
          } catch {
            // Token is invalid, redirect to login
            authService.logout();
            setIsAuthenticated(false);
            navigate('/login', { 
              state: { 
                message: 'Bitte melde dich an, um Spiele zu spielen.',
                returnTo: window.location.pathname
              }
            });
          }
        } else {
          // No token, redirect to login
          setIsAuthenticated(false);
          navigate('/login', { 
            state: { 
              message: 'Bitte melde dich an, um Spiele zu spielen.',
              returnTo: window.location.pathname
            }
          });
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return {
    isAuthenticated,
    isLoading,
  };
} 