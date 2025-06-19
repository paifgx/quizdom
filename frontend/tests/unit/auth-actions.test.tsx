import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthActions } from '../../app/components/auth/auth-actions';

describe('AuthActions', () => {
  const defaultProps = {
    isSignupMode: false,
    loading: false,
    isFormValid: true,
    rememberMe: false,
    onRememberMeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <AuthActions {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('shows remember me checkbox in login mode', () => {
    renderComponent({ isSignupMode: false });

    expect(screen.getByLabelText('Angemeldet bleiben')).toBeDefined();
  });

  it('hides remember me checkbox in signup mode', () => {
    renderComponent({ isSignupMode: true });

    expect(screen.queryByLabelText('Angemeldet bleiben')).toBeNull();
  });

  it('shows forgot password link in login mode', () => {
    renderComponent({ isSignupMode: false });

    expect(screen.getByText('Passwort vergessen?')).toBeDefined();
  });

  it('hides forgot password link in signup mode', () => {
    renderComponent({ isSignupMode: true });

    expect(screen.queryByText('Passwort vergessen?')).toBeNull();
  });

  it('shows correct submit button text for login', () => {
    renderComponent({ isSignupMode: false });

    expect(screen.getByText('Login')).toBeDefined();
    expect(screen.getByText('Sign Up')).toBeDefined();
  });

  it('shows correct submit button text for signup', () => {
    renderComponent({ isSignupMode: true });

    expect(screen.getByText('Konto erstellen')).toBeDefined();
    expect(screen.getByText('Zurück zur Anmeldung')).toBeDefined();
  });

  it('disables submit button when form is invalid', () => {
    renderComponent({ isFormValid: false });

    const submitButton = screen.getByText('Login');
    expect(submitButton.getAttribute('disabled')).toBe('');
  });
});
