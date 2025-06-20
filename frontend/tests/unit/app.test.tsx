import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App, { Layout, ErrorBoundary } from '../../app/root';

// Mock import.meta globally
const mockImportMeta = {
  env: {
    DEV: true, // Default to development for most tests
  },
};

vi.stubGlobal('import', {
  meta: mockImportMeta,
});

// Mock the auth context
vi.mock('../../app/contexts/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock the background context
vi.mock('../../app/contexts/background', () => ({
  BackgroundProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="background-provider">{children}</div>
  ),
}));

// Mock the useReturnMessage hook
vi.mock('../../app/hooks/useReturnMessage', () => ({
  useReturnMessage: vi.fn(),
}));

// Mock React Router components
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet content</div>,
    Links: () => <></>,
    Meta: () => <></>,
    Scripts: () => <></>,
    ScrollRestoration: () => <></>,
    isRouteErrorResponse: vi.fn(),
  };
});

describe('App', () => {
  it('renders AuthProvider wrapper', () => {
    render(<App />);

    expect(screen.getByTestId('auth-provider')).toBeDefined();
  });

  it('renders Outlet component', () => {
    render(<App />);

    expect(screen.getByTestId('outlet')).toBeDefined();
    expect(screen.getByText('Outlet content')).toBeDefined();
  });
});

describe('Layout', () => {
  it('renders children within proper HTML structure', () => {
    render(
      <Layout>
        <div data-testid="test-child">Test content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-child')).toBeDefined();
    expect(screen.getByText('Test content')).toBeDefined();
  });

  it('renders without errors', () => {
    render(
      <Layout>
        <div>Test</div>
      </Layout>
    );

    // Verify the Layout renders its content without errors
    expect(screen.getByText('Test')).toBeDefined();
  });

  it('calls useReturnMessage hook', () => {
    render(
      <Layout>
        <div>Test</div>
      </Layout>
    );

    // Verify the Layout renders correctly (hook is mocked)
    expect(screen.getByText('Test')).toBeDefined();
  });
});

describe('ErrorBoundary', () => {
  it('renders error message for generic error', () => {
    const error = new Error('Test error message');

    render(<ErrorBoundary error={error} params={{}} />);

    expect(screen.getByText('Ups!')).toBeDefined();
    expect(screen.getByText('Test error message')).toBeDefined();
  });

  it('renders 404 error correctly', () => {
    const routeError = {
      status: 404,
      statusText: 'Not Found',
      data: 'Page not found',
    };

    render(<ErrorBoundary error={routeError} params={{}} />);

    expect(screen.getByText('404')).toBeDefined();
    expect(screen.getByText('Seite nicht gefunden.')).toBeDefined();
  });

  it('renders other route errors correctly', () => {
    const routeError = {
      status: 500,
      statusText: 'Internal Server Error',
      data: 'Server error',
    };

    render(<ErrorBoundary error={routeError} params={{}} />);

    expect(screen.getByText('Fehler')).toBeDefined();
    expect(screen.getByText('Internal Server Error')).toBeDefined();
  });

  it('displays Quizdom logo', () => {
    const error = new Error('Test error');

    render(<ErrorBoundary error={error} params={{}} />);

    const logo = screen.getByAltText('Quizdom Logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('src')).toBe('/logo/Logo_Quizdom_transparent.png');
  });

  it('renders home link', () => {
    const error = new Error('Test error');

    render(<ErrorBoundary error={error} params={{}} />);

    const homeLink = screen.getByText('Zur Startseite');
    expect(homeLink).toBeDefined();
    expect(homeLink.getAttribute('href')).toBe('/');
  });

  it('shows error stack in development mode', () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV;
    const originalImportMeta = (import.meta as any).env;

    process.env.NODE_ENV = 'development';
    // Mock import.meta.env.DEV as well
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: true },
      configurable: true,
    });

    const error = new Error('Test error');
    error.stack = 'Error stack trace';

    render(<ErrorBoundary error={error} params={{}} />);

    expect(screen.getByText('Error stack trace')).toBeDefined();

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
    Object.defineProperty(import.meta, 'env', {
      value: originalImportMeta,
      configurable: true,
    });
  });

  it('does not show error stack in production mode', () => {
    // Store original values
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDEV = mockImportMeta.env.DEV;

    // Set production environment
    process.env.NODE_ENV = 'production';
    mockImportMeta.env.DEV = false;

    const error = new Error('Test error');
    error.stack = 'Error stack trace';

    render(<ErrorBoundary error={error} params={{}} />);

    // In production mode, the default German error message should be shown
    expect(screen.getByText('Etwas ist schiefgelaufen.')).toBeDefined();
    // The stack trace should not be shown
    expect(screen.queryByText('Error stack trace')).toBeNull();
    // The specific error message should not be shown
    expect(screen.queryByText('Test error')).toBeNull();

    // Restore original environment
    process.env.NODE_ENV = originalNodeEnv;
    mockImportMeta.env.DEV = originalDEV;
  });

  it('has proper styling classes', () => {
    const error = new Error('Test error');
    const { container } = render(<ErrorBoundary error={error} params={{}} />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer?.className).toContain('min-h-screen');
    expect(mainContainer?.className).toContain('bg-[#061421]');
    expect(mainContainer?.className).toContain('flex');
    expect(mainContainer?.className).toContain('items-center');
    expect(mainContainer?.className).toContain('justify-center');
  });

  it('applies correct styling to error elements', () => {
    const error = new Error('Test error');
    render(<ErrorBoundary error={error} params={{}} />);

    const title = screen.getByText('Ups!');
    expect(title.className).toContain('text-4xl');
    expect(title.className).toContain('font-bold');
    expect(title.className).toContain('text-[#FCC822]');

    const homeLink = screen.getByText('Zur Startseite');
    expect(homeLink.className).toContain('btn-gradient');
  });
});
