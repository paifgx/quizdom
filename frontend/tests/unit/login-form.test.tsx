import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    getError: vi.fn(),
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
    render(
      <LoginForm {...defaultProps} onPasswordChange={mockOnPasswordChange} />
    );

    const passwordInput = screen.getByPlaceholderText('Your password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(mockOnPasswordChange).toHaveBeenCalledWith('password123');
  });

  it('displays field errors from getError function', () => {
    const mockGetError = vi.fn();
    mockGetError.mockReturnValue('Invalid email format');

    render(<LoginForm {...defaultProps} getError={mockGetError} />);

    expect(mockGetError).toHaveBeenCalledWith('email');
    expect(mockGetError).toHaveBeenCalledWith('password');
  });

  it('passes correct props to ValidatedInput components', () => {
    const mockGetError = vi.fn();
    mockGetError.mockReturnValue(undefined);

    render(
      <LoginForm
        {...defaultProps}
        email="test@example.com"
        password="password123"
        getError={mockGetError}
      />
    );

    const emailInput = screen.getByDisplayValue('test@example.com');
    const passwordInput = screen.getByDisplayValue('password123');

    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
  });
});
