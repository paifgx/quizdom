import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainNav } from '../../app/components/navigation/main-nav';

// Mock the auth context
vi.mock('../../app/contexts/auth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'player',
    },
    isAuthenticated: true,
    isAdmin: false,
    logout: vi.fn(),
  }),
}));

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => vi.fn(),
}));

describe('MainNav', () => {
  it('renders the logo and brand name', () => {
    render(<MainNav />);

    expect(screen.getByText('QUIZDOM')).toBeDefined();
    expect(screen.getByAltText('Quizdom Logo')).toBeDefined();
  });

  it('renders navigation links for authenticated users', () => {
    render(<MainNav />);

    expect(screen.getByText('Start')).toBeDefined();
    expect(screen.getByText('Themen')).toBeDefined();
    expect(screen.getByText('Spielmodi')).toBeDefined();
    expect(screen.getByText('Benutzerhandbuch')).toBeDefined();
  });

  it('shows user menu links when user dropdown is opened', () => {
    render(<MainNav />);

    // Click on the user dropdown button (find by username text)
    const userButton = screen.getByText('testuser').closest('button');
    if (!userButton) throw new Error('User button not found');
    fireEvent.click(userButton);

    // Check that user menu links are now visible
    expect(screen.getByText('Profil')).toBeDefined();
    expect(screen.getByText('Fortschritt')).toBeDefined();
  });

  it('does not show admin dropdown for regular users', () => {
    render(<MainNav />);

    expect(screen.queryByText('Admin')).toBeNull();
  });
});
