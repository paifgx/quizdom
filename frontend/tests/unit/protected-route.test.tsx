import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ProtectedRoute } from '../../app/components/auth/protected-route';

// Mock the Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Navigate: ({ to, state, replace }: any) => {
      mockNavigate(to, state, replace);
      return <div data-testid="navigate" data-to={to} />;
    },
    useLocation: () => ({ pathname: '/test' }),
  };
});

// Mock the auth context
const mockAuthContext = {
  isAuthenticated: true,
  isAdmin: false,
  isViewingAsAdmin: false,
  loading: false,
};

vi.mock('../../app/contexts/auth', () => ({
  useAuth: () => mockAuthContext,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock auth context to defaults
    Object.assign(mockAuthContext, {
      isAuthenticated: true,
      isAdmin: false,
      isViewingAsAdmin: false,
      loading: false,
    });
  });

  const TestChild = () => (
    <div data-testid="protected-content">Protected Content</div>
  );

  it('renders children when user is authenticated', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeDefined();
  });

  it('shows loading spinner when loading is true', () => {
    Object.assign(mockAuthContext, { loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Laden...')).toBeDefined();
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('redirects to login when user is not authenticated', () => {
    Object.assign(mockAuthContext, { isAuthenticated: false });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/login',
      { from: { pathname: '/test' } },
      true
    );
  });

  it('renders children for admin when requireAdmin is true and user is admin', () => {
    Object.assign(mockAuthContext, {
      isAuthenticated: true,
      isAdmin: true,
      isViewingAsAdmin: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeDefined();
  });

  it('redirects to 403 when requireAdmin is true but user is not admin', () => {
    Object.assign(mockAuthContext, {
      isAuthenticated: true,
      isAdmin: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/403', undefined, true);
  });

  it('redirects to home when admin is not viewing as admin on admin route', () => {
    Object.assign(mockAuthContext, {
      isAuthenticated: true,
      isAdmin: true,
      isViewingAsAdmin: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', undefined, true);
  });

  it('does not require admin by default', () => {
    Object.assign(mockAuthContext, {
      isAuthenticated: true,
      isAdmin: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeDefined();
  });
});
