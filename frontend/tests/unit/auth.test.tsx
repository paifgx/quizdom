import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth, type User } from '../../app/contexts/auth'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    })

    it('provides initial auth state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.activeRole).toBe('player')
      expect(result.current.isViewingAsAdmin).toBe(false)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('login functionality', () => {
    it('successfully logs in a regular user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('user@example.com', 'password')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.email).toBe('user@example.com')
      expect(result.current.user?.username).toBe('user')
      expect(result.current.user?.role).toBe('player')
      expect(result.current.activeRole).toBe('player')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quizdom_user',
        expect.stringContaining('"email":"user@example.com"')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith('quizdom_active_role', 'player')
    })

    it('successfully logs in an admin user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin@example.com', 'password')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.email).toBe('admin@example.com')
      expect(result.current.user?.username).toBe('admin')
      expect(result.current.user?.role).toBe('admin')
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.activeRole).toBe('admin')
    })

    it('sets loading state during login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      const loginPromise = act(async () => {
        await result.current.login('user@example.com', 'password')
      })

      // Check loading state is true during login
      expect(result.current.loading).toBe(true)

      await loginPromise

      // Check loading state is false after login
      expect(result.current.loading).toBe(false)
    })
  })

  describe('logout functionality', () => {
    it('successfully logs out user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login
      await act(async () => {
        await result.current.login('user@example.com', 'password')
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.activeRole).toBe('player')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizdom_user')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizdom_active_role')
    })
  })

  describe('role switching functionality', () => {
    it('allows admin to switch to admin view', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      const mockNavigate = vi.fn()

      // Login as admin
      await act(async () => {
        await result.current.login('admin@example.com', 'password')
      })

      // Switch to admin view
      act(() => {
        result.current.switchToAdminView(mockNavigate, '/')
      })

      expect(result.current.activeRole).toBe('admin')
      expect(result.current.isViewingAsAdmin).toBe(true)
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('quizdom_active_role', 'admin')
    })

    it('allows admin to switch to player view', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      const mockNavigate = vi.fn()

      // Login as admin
      await act(async () => {
        await result.current.login('admin@example.com', 'password')
      })

      // Switch to player view
      act(() => {
        result.current.switchToPlayerView(mockNavigate, '/admin/dashboard')
      })

      expect(result.current.activeRole).toBe('player')
      expect(result.current.isViewingAsAdmin).toBe(false)
      expect(mockNavigate).toHaveBeenCalledWith('/')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('quizdom_active_role', 'player')
    })

    it('does not allow regular user to switch to admin view', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // Login as regular user
      await act(async () => {
        await result.current.login('user@example.com', 'password')
      })

      // Try to switch to admin view
      act(() => {
        result.current.switchToAdminView()
      })

      expect(result.current.activeRole).toBe('player')
      expect(result.current.isViewingAsAdmin).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('restores user from localStorage on initialization', async () => {
      const mockUser: User = {
        id: '1',
        email: 'user@example.com',
        username: 'user',
        role: 'player',
        wisecoins: 100,
        achievements: []
      }

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'quizdom_user') return JSON.stringify(mockUser)
        if (key === 'quizdom_active_role') return 'player'
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.activeRole).toBe('player')
    })

    it('handles invalid localStorage data gracefully', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'quizdom_user') return 'invalid-json'
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.user).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizdom_user')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quizdom_active_role')
    })
  })
}) 