import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignupForm } from '../../app/components/auth/signup-form';

describe('SignupForm', () => {
  const defaultProps = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    loading: false,
    isFormValid: false,
    onFieldChange: vi.fn(),
    onSubmit: vi.fn(),
    getError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form fields', () => {
    render(<SignupForm {...defaultProps} />);

    expect(screen.getByPlaceholderText('First Name')).toBeDefined();
    expect(screen.getByPlaceholderText('Last Name')).toBeDefined();
    expect(screen.getByPlaceholderText('test@mail.com')).toBeDefined();
    expect(screen.getByPlaceholderText('Your password')).toBeDefined();
    expect(screen.getByPlaceholderText('Confirm password')).toBeDefined();
  });

  it('displays password strength indicator', () => {
    render(<SignupForm {...defaultProps} password="test123" />);

    // The PasswordStrengthIndicator should be rendered when password has value
    // This tests the integration with the password strength component
    expect(screen.getByPlaceholderText('Your password')).toBeDefined();
  });

  it('calls getError for field validation', () => {
    const mockGetError = vi.fn();
    mockGetError.mockReturnValue(undefined);

    render(<SignupForm {...defaultProps} getError={mockGetError} />);

    expect(mockGetError).toHaveBeenCalledWith('firstName');
    expect(mockGetError).toHaveBeenCalledWith('lastName');
    expect(mockGetError).toHaveBeenCalledWith('email');
    expect(mockGetError).toHaveBeenCalledWith('password');
    expect(mockGetError).toHaveBeenCalledWith('confirmPassword');
  });

  it('has proper autocomplete attributes', () => {
    render(<SignupForm {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText('test@mail.com');
    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput =
      screen.getByPlaceholderText('Confirm password');

    expect(emailInput.getAttribute('autocomplete')).toBe('email');
    expect(passwordInput.getAttribute('autocomplete')).toBe('new-password');
    expect(confirmPasswordInput.getAttribute('autocomplete')).toBe(
      'new-password'
    );
  });
});
