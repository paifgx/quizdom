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
    onRememberMeChange: vi.fn()
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
    
    expect(screen.getByLabelText('Remember Me')).toBeDefined();
    expect(screen.getByText('Forgot Password?')).toBeDefined();
  });

  it('hides remember me checkbox in signup mode', () => {
    renderComponent({ isSignupMode: true });
    
    expect(screen.queryByLabelText('Remember Me')).toBeNull();
    expect(screen.queryByText('Forgot Password?')).toBeNull();
  });

  it('shows correct submit button text for login', () => {
    renderComponent({ isSignupMode: false });
    
    expect(screen.getByText('Login')).toBeDefined();
    expect(screen.getByText('Sign Up')).toBeDefined();
  });

  it('shows correct submit button text for signup', () => {
    renderComponent({ isSignupMode: true });
    
    expect(screen.getByText('Create Account')).toBeDefined();
    expect(screen.getByText('Back to Login')).toBeDefined();
  });

  it('disables submit button when form is invalid', () => {
    renderComponent({ isFormValid: false });
    
    const submitButton = screen.getByText('Login');
    expect(submitButton.getAttribute('disabled')).toBe('');
  });
}); 