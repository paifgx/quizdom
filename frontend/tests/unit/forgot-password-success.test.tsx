import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ForgotPasswordSuccess } from '../../app/components/auth/forgot-password-success';

describe('ForgotPasswordSuccess', () => {
  const defaultProps = {
    email: 'test@example.com',
    onSendAnother: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ForgotPasswordSuccess {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('renders success message', () => {
    renderComponent();

    expect(screen.getByText('E-Mail erfolgreich gesendet!')).toBeDefined();
  });

  it('renders email sent icon', () => {
    renderComponent();

    const icon = screen.getByLabelText('E-Mail gesendet');
    expect(icon).toBeDefined();
  });

  it('renders send another email button', () => {
    renderComponent();

    const button = screen.getByRole('button', {
      name: /weitere e-mail senden/i,
    });
    expect(button).toBeDefined();
  });

  it('calls onSendAnother when send another email button is clicked', () => {
    const mockOnSendAnother = vi.fn();
    renderComponent({ onSendAnother: mockOnSendAnother });

    const button = screen.getByRole('button', {
      name: /weitere e-mail senden/i,
    });
    button.click();

    expect(mockOnSendAnother).toHaveBeenCalledTimes(1);
  });

  it('renders back to login link', () => {
    renderComponent();

    const loginLink = screen.getByRole('link', { name: /zurück zur anmeldung/i });
    expect(loginLink).toBeDefined();
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  it('displays the email in bold within the success message', () => {
    renderComponent({ email: 'user@domain.com' });

    const emailElement = screen.getByText('user@domain.com');
    expect(emailElement.tagName).toBe('STRONG');
  });

  it('has proper styling classes for success state', () => {
    renderComponent();

    const successMessage = screen.getByText('E-Mail erfolgreich gesendet!');
    const container = successMessage.closest('.bg-green-50');
    expect(container).toBeDefined();
    expect(container?.className).toContain('border-green-300');
    expect(container?.className).toContain('text-green-800');
  });

  it('has animation class on main container', () => {
    const { container } = renderComponent();

    const mainContainer = container.querySelector('.animate-fade-in');
    expect(mainContainer).toBeDefined();
  });

  it('displays success icon with proper styling', () => {
    renderComponent();

    const iconContainer = screen
      .getByLabelText('E-Mail gesendet')
      .closest('.bg-green-100');
    expect(iconContainer).toBeDefined();
    expect(iconContainer?.className).toContain('rounded-full');
    expect(iconContainer?.className).toContain('h-16');
    expect(iconContainer?.className).toContain('w-16');
  });

  it('renders with different email addresses', () => {
    renderComponent({ email: 'different@email.org' });

    expect(screen.getByText('different@email.org')).toBeDefined();
    expect(
      screen.getByText(/Wir haben Anweisungen zum Zurücksetzen des Passworts an/)
    ).toBeDefined();
  });
});
