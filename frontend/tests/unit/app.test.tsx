import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet } from 'react-router'
import App, { ErrorBoundary, Layout } from '../../app/root'

// Mock the auth context
vi.mock('../../app/contexts/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}))

// Mock the useReturnMessage hook
vi.mock('../../app/hooks/useReturnMessage', () => ({
  useReturnMessage: vi.fn()
}))

// Mock React Router components
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet content</div>,
    Links: () => <div data-testid="links">Links</div>,
    Meta: () => <div data-testid="meta">Meta</div>,
    Scripts: () => <div data-testid="scripts">Scripts</div>,
    ScrollRestoration: () => <div data-testid="scroll-restoration">ScrollRestoration</div>
  }
})

describe('App', () => {
  it('renders AuthProvider wrapper', () => {
    render(<App />)
    
    expect(screen.getByTestId('auth-provider')).toBeDefined()
  })

  it('renders Outlet component', () => {
    render(<App />)
    
    expect(screen.getByTestId('outlet')).toBeDefined()
    expect(screen.getByText('Outlet content')).toBeDefined()
  })
})

describe('Layout', () => {
  it('renders children within proper HTML structure', () => {
    render(
      <Layout>
        <div data-testid="test-child">Test content</div>
      </Layout>
    )
    
    expect(screen.getByTestId('test-child')).toBeDefined()
    expect(screen.getByText('Test content')).toBeDefined()
  })

  it('renders Meta, Links, and Scripts components', () => {
    render(
      <Layout>
        <div>Test</div>
      </Layout>
    )
    
    expect(screen.getByTestId('meta')).toBeDefined()
    expect(screen.getByTestId('links')).toBeDefined()
    expect(screen.getByTestId('scripts')).toBeDefined()
    expect(screen.getByTestId('scroll-restoration')).toBeDefined()
  })

  it('sets correct HTML attributes', () => {
    const { container } = render(
      <Layout>
        <div>Test</div>
      </Layout>
    )
    
    const html = container.querySelector('html')
    expect(html?.getAttribute('lang')).toBe('de')
  })

  it('sets correct meta viewport', () => {
    render(
      <Layout>
        <div>Test</div>
      </Layout>
    )
    
    const metaViewport = document.querySelector('meta[name="viewport"]')
    expect(metaViewport?.getAttribute('content')).toBe('width=device-width, initial-scale=1')
  })
})

describe('ErrorBoundary', () => {
  it('renders error message for generic error', () => {
    const error = new Error('Test error message')
    
    render(<ErrorBoundary error={error} params={{}} />)
    
    expect(screen.getByText('Oops!')).toBeDefined()
    expect(screen.getByText('Test error message')).toBeDefined()
  })

  it('renders 404 error correctly', () => {
    const routeError = {
      status: 404,
      statusText: 'Not Found',
      data: 'Page not found'
    }
    
    render(<ErrorBoundary error={routeError} params={{}} />)
    
    expect(screen.getByText('404')).toBeDefined()
    expect(screen.getByText('The requested page could not be found.')).toBeDefined()
  })

  it('renders other route errors correctly', () => {
    const routeError = {
      status: 500,
      statusText: 'Internal Server Error',
      data: 'Server error'
    }
    
    render(<ErrorBoundary error={routeError} params={{}} />)
    
    expect(screen.getByText('Error')).toBeDefined()
    expect(screen.getByText('Internal Server Error')).toBeDefined()
  })

  it('displays Quizdom logo', () => {
    const error = new Error('Test error')
    
    render(<ErrorBoundary error={error} params={{}} />)
    
    const logo = screen.getByAltText('Quizdom Logo')
    expect(logo).toBeDefined()
    expect(logo.getAttribute('src')).toBe('/logo/Logo_Quizdom_transparent.png')
  })

  it('renders home link', () => {
    const error = new Error('Test error')
    
    render(<ErrorBoundary error={error} params={{}} />)
    
    const homeLink = screen.getByText('Zur Startseite')
    expect(homeLink).toBeDefined()
    expect(homeLink.getAttribute('href')).toBe('/')
  })

  it('shows error stack in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: true, writable: true })
    
    const error = new Error('Test error')
    error.stack = 'Error stack trace'
    
    render(<ErrorBoundary error={error} params={{}} />)
    
    expect(screen.getByText('Error stack trace')).toBeDefined()
    
    // Restore original environment
    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv })
  })

  it('does not show error stack in production mode', () => {
    // Mock production environment
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: false, writable: true })
    
    const error = new Error('Test error')
    error.stack = 'Error stack trace'
    
    render(<ErrorBoundary error={error} params={{}} />)
    
    expect(screen.queryByText('Error stack trace')).toBeNull()
    
    // Restore original environment
    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv })
  })

  it('has proper styling classes', () => {
    const error = new Error('Test error')
    const { container } = render(<ErrorBoundary error={error} params={{}} />)
    
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer?.className).toContain('min-h-screen')
    expect(mainContainer?.className).toContain('bg-[#061421]')
    expect(mainContainer?.className).toContain('flex')
    expect(mainContainer?.className).toContain('items-center')
    expect(mainContainer?.className).toContain('justify-center')
  })

  it('applies correct styling to error elements', () => {
    const error = new Error('Test error')
    render(<ErrorBoundary error={error} params={{}} />)
    
    const title = screen.getByText('Oops!')
    expect(title.className).toContain('text-4xl')
    expect(title.className).toContain('font-bold')
    expect(title.className).toContain('text-[#FCC822]')
    
    const homeLink = screen.getByText('Zur Startseite')
    expect(homeLink.className).toContain('btn-gradient')
  })
}) 