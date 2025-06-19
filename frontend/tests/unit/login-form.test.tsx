import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../../app/components/auth/login-form';

describe('LoginForm', () => {
  const defaultProps = {
    email: '',
    password: '',
    rememberMe: false,
    loading: false,
    isFormValid: false,
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onRememberMeChange: vi.fn(),
    onSubmit: vi.fn(),
    getError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    render(<LoginForm {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('test@mail.com')).toBeDefined();
    expect(screen.getByPlaceholderText('Your password')).toBeDefined();
  });

  it('calls onEmailChange when email input changes', () => {
    const mockOnEmailChange = vi.fn();
    render(<LoginForm {...defaultProps} onEmailChange={mockOnEmailChange} />);
    
    const emailInput = screen.getByPlaceholderText('test@mail.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(mockOnEmailChange).toHaveBeenCalledWith('test@example.com');
  });

  it('calls onPasswordChange when password input changes', () => {
    const mockOnPasswordChange = vi.fn();
    render(<LoginForm {...defaultProps} onPasswordChange={mockOnPasswordChange} />);
    
    const passwordInput = screen.getByPlaceholderText('Your password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(mockOnPasswordChange).toHaveBeenCalledWith('password123');
  });

  it('displays error message when error prop is provided', () => {
    render(<LoginForm {...defaultProps} error="Invalid credentials" />);
    
    const errorMessage = screen.getByText('Invalid credentials');
    expect(errorMessage).toBeDefined();
    expect(errorMessage.getAttribute('role')).toBe('alert');
  });

  it('calls onSubmit when form is submitted', () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<LoginForm {...defaultProps} onSubmit={mockOnSubmit} />);
    
    const form = container.querySelector('form');
    fireEvent.submit(form!);
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });
}); 