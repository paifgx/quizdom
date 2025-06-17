import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ForgotPasswordSuccess } from '../../app/components/auth/forgot-password-success'

describe('ForgotPasswordSuccess', () => {
  const defaultProps = {
    email: 'test@example.com',
    onSendAnother: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ForgotPasswordSuccess {...defaultProps} {...props} />
      </MemoryRouter>
    )
  }

  it('renders success message and email', () => {
    renderComponent()
    
    expect(screen.getByText('Email sent successfully!')).toBeDefined()
    expect(screen.getByText(/We've sent password reset instructions to/)).toBeDefined()
    expect(screen.getByText('test@example.com')).toBeDefined()
  })

  it('displays the success icon with proper accessibility', () => {
    renderComponent()
    
    const icon = screen.getByLabelText('Email sent')
    expect(icon).toBeDefined()
    expect(icon.tagName).toBe('svg')
  })

  it('renders send another email button', () => {
    renderComponent()
    
    const sendAnotherButton = screen.getByRole('button', { name: /send another email/i })
    expect(sendAnotherButton).toBeDefined()
  })

  it('calls onSendAnother when send another email button is clicked', () => {
    const mockOnSendAnother = vi.fn()
    renderComponent({ onSendAnother: mockOnSendAnother })
    
    const sendAnotherButton = screen.getByRole('button', { name: /send another email/i })
    fireEvent.click(sendAnotherButton)
    
    expect(mockOnSendAnother).toHaveBeenCalledTimes(1)
  })

  it('renders back to login link', () => {
    renderComponent()
    
    const loginLink = screen.getByRole('link', { name: /back to login/i })
    expect(loginLink).toBeDefined()
    expect(loginLink.getAttribute('href')).toBe('/login')
  })

  it('displays the email in bold within the success message', () => {
    renderComponent({ email: 'user@domain.com' })
    
    const emailElement = screen.getByText('user@domain.com')
    expect(emailElement.tagName).toBe('STRONG')
  })

  it('has proper styling classes for success state', () => {
    renderComponent()
    
    const successMessage = screen.getByText('Email sent successfully!')
    const container = successMessage.closest('.bg-green-50')
    expect(container).toBeDefined()
    expect(container?.className).toContain('border-green-300')
    expect(container?.className).toContain('text-green-800')
  })

  it('has animation class on main container', () => {
    const { container } = renderComponent()
    
    const mainContainer = container.querySelector('.animate-fade-in')
    expect(mainContainer).toBeDefined()
  })

  it('displays success icon with proper styling', () => {
    renderComponent()
    
    const iconContainer = screen.getByLabelText('Email sent').closest('.bg-green-100')
    expect(iconContainer).toBeDefined()
    expect(iconContainer?.className).toContain('rounded-full')
    expect(iconContainer?.className).toContain('h-16')
    expect(iconContainer?.className).toContain('w-16')
  })

  it('renders with different email addresses', () => {
    renderComponent({ email: 'different@email.org' })
    
    expect(screen.getByText('different@email.org')).toBeDefined()
    expect(screen.getByText(/We've sent password reset instructions to/)).toBeDefined()
  })
}) 