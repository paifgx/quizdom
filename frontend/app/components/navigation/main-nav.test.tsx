import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MainNav } from './main-nav'

// Mock the auth context
vi.mock('../../contexts/auth', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'player' },
    isAuthenticated: true,
    isAdmin: false,
    logout: vi.fn(),
  }),
}))

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: '/' }),
}))

describe('MainNav', () => {
  it('renders the logo and brand name', () => {
    render(<MainNav />)
    
    expect(screen.getByText('QUIZDOM')).toBeDefined()
    expect(screen.getByAltText('Quizdom Logo')).toBeDefined()
  })

  it('renders navigation links for authenticated users', () => {
    render(<MainNav />)
    
    expect(screen.getByText('Start')).toBeDefined()
    expect(screen.getByText('Quizübersicht')).toBeDefined()
    expect(screen.getByText('Spielmodi')).toBeDefined()
    expect(screen.getByText('Fortschritt')).toBeDefined()
    expect(screen.getByText('Profil')).toBeDefined()
  })

  it('does not show admin dropdown for regular users', () => {
    render(<MainNav />)
    
    expect(screen.queryByText('Admin')).toBeNull()
  })
}) 