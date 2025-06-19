import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrengthIndicator } from '../../app/components/auth/password-strength-indicator';

// Mock the useFormValidation hook
vi.mock('../../app/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    getPasswordStrength: (password: string) => {
      if (password.length < 6) return { strength: 'weak', score: 0 };
      if (password.length < 8) return { strength: 'fair', score: 1 };
      if (
        password.length >= 8 &&
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
      ) {
        return { strength: 'strong', score: 3 };
      }
      if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
        return { strength: 'good', score: 2 };
      }
      return { strength: 'fair', score: 1 };
    },
  }),
}));

describe('PasswordStrengthIndicator', () => {
  it('renders nothing for empty password', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows weak strength for short passwords', () => {
    render(<PasswordStrengthIndicator password="123" />);

    expect(screen.getByText('Password strength: Weak')).toBeDefined();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('3');
  });

  it('shows fair strength for medium passwords', () => {
    render(<PasswordStrengthIndicator password="123456" />);

    expect(screen.getByText('Password strength: Fair')).toBeDefined();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('1');
  });

  it('shows good strength for strong passwords', () => {
    render(<PasswordStrengthIndicator password="Password" />);

    expect(screen.getByText('Password strength: Good')).toBeDefined();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('2');
  });

  it('shows strong strength for very strong passwords', () => {
    render(<PasswordStrengthIndicator password="Password123" />);

    expect(screen.getByText('Password strength: Strong')).toBeDefined();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('3');
  });

  it('renders correct number of strength bars', () => {
    render(<PasswordStrengthIndicator password="test" />);

    const progressbar = screen.getByRole('progressbar');
    const bars = progressbar.querySelectorAll('div');
    expect(bars).toHaveLength(4);
  });

  it('has proper accessibility attributes', () => {
    render(<PasswordStrengthIndicator password="test123" />);

    const strengthText = screen.getByText(/Password strength:/);
    expect(strengthText.getAttribute('aria-live')).toBe('polite');

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBeDefined();
    expect(progressbar.getAttribute('aria-valuemax')).toBeDefined();
  });
});
