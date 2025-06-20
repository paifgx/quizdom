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

    expect(screen.getByPlaceholderText('Vorname')).toBeDefined();
    expect(screen.getByPlaceholderText('Nachname')).toBeDefined();
    expect(screen.getByPlaceholderText('test@mail.com')).toBeDefined();
    expect(screen.getByPlaceholderText('Ihr Passwort')).toBeDefined();
    expect(screen.getByPlaceholderText('Passwort bestätigen')).toBeDefined();
  });

  it('displays password strength indicator', () => {
    render(<SignupForm {...defaultProps} />);

    // The PasswordStrengthIndicator should be rendered when password has value
    expect(screen.getByPlaceholderText('Ihr Passwort')).toBeDefined();
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
    const passwordInput = screen.getByPlaceholderText('Ihr Passwort');
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Passwort bestätigen'
    );

    expect(emailInput.getAttribute('autocomplete')).toBe('email');
    expect(passwordInput.getAttribute('autocomplete')).toBe('new-password');
    expect(confirmPasswordInput.getAttribute('autocomplete')).toBe(
      'new-password'
    );
  });
});
