import { type ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Protected route wrapper that enforces authentication and authorization
 * Redirects unauthenticated users and handles admin access control
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isViewingAsAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle redirects with useEffect to avoid initial render issues
  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    // Check admin access for admin routes
    if (requireAdmin && !isAdmin) {
      navigate('/403', { replace: true });
      return;
    }

    // Check if user is trying to access admin routes while not in admin view
    // If an admin is on an admin route but switched to player view, redirect to home
    if (requireAdmin && isAdmin && !isViewingAsAdmin) {
      navigate('/', { replace: true });
      return;
    }
  }, [
    isAuthenticated,
    isAdmin,
    isViewingAsAdmin,
    loading,
    navigate,
    location,
    requireAdmin,
  ]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#061421] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state during redirect to prevent flash
  if (
    !isAuthenticated ||
    (requireAdmin && !isAdmin) ||
    (requireAdmin && isAdmin && !isViewingAsAdmin)
  ) {
    return (
      <div className="min-h-screen bg-[#061421] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto"></div>
          <p className="text-white mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
