import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ValidatedInput } from '../../app/components/auth/validated-input'

describe('ValidatedInput', () => {
  const defaultProps = {
    id: 'test-input',
    name: 'test',
    type: 'text',
    placeholder: 'Enter test',
    value: '',
    onChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input with basic props', () => {
    render(<ValidatedInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDefined()
    expect(input.getAttribute('id')).toBe('test-input')
    expect(input.getAttribute('name')).toBe('test')
    expect(input.getAttribute('type')).toBe('text')
    expect(input.getAttribute('placeholder')).toBe('Enter test')
  })

  it('displays the current value', () => {
    render(<ValidatedInput {...defaultProps} value="test value" />)
    
    const input = screen.getByDisplayValue('test value')
    expect(input).toBeDefined()
  })

  it('calls onChange when input value changes', () => {
    const mockOnChange = vi.fn()
    render(<ValidatedInput {...defaultProps} onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(mockOnChange).toHaveBeenCalledWith('new value')
  })

  it('shows error message when error prop is provided', () => {
    render(<ValidatedInput {...defaultProps} error="This field is required" />)
    
    const errorMessage = screen.getByText('This field is required')
    expect(errorMessage).toBeDefined()
    expect(errorMessage.getAttribute('role')).toBe('alert')
  })

  it('applies error styling when error is present', () => {
    render(<ValidatedInput {...defaultProps} error="This field is required" />)
    
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-red-300')
    expect(input.className).toContain('focus:ring-red-500')
    expect(input.className).toContain('focus:border-red-500')
  })

  it('applies normal styling when no error', () => {
    render(<ValidatedInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-gray-300')
    expect(input.className).toContain('focus:ring-[#FCC822]')
    expect(input.className).toContain('focus:border-transparent')
  })

  it('sets aria-invalid when error is present', () => {
    render(<ValidatedInput {...defaultProps} error="This field is required" />)
    
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('sets aria-describedby when error is present', () => {
    render(<ValidatedInput {...defaultProps} error="This field is required" />)
    
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('aria-describedby')).toBe('test-input-error')
  })

  it('renders as required when required prop is true', () => {
    render(<ValidatedInput {...defaultProps} required={true} />)
    
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('required')).toBe('')
  })

  it('sets autoComplete attribute when provided', () => {
    render(<ValidatedInput {...defaultProps} autoComplete="email" />)
    
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('autocomplete')).toBe('email')
  })

  it('applies custom className when provided', () => {
    render(<ValidatedInput {...defaultProps} className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('custom-class')
  })

  it('does not render error message when no error', () => {
    render(<ValidatedInput {...defaultProps} />)
    
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('associates error message with input using correct id', () => {
    render(<ValidatedInput {...defaultProps} error="This field is required" />)
    
    const errorMessage = screen.getByText('This field is required')
    expect(errorMessage.getAttribute('id')).toBe('test-input-error')
  })
}) 