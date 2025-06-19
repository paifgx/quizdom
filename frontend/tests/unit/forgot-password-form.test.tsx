import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ForgotPasswordForm } from '../../app/components/auth/forgot-password-form';

describe('ForgotPasswordForm', () => {
  const defaultProps = {
    email: '',
    onEmailChange: vi.fn(),
    onSubmit: vi.fn(),
    loading: false,
    hasEmailError: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ForgotPasswordForm {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('renders the form elements', () => {
    renderComponent();

    expect(screen.getByRole('textbox')).toBeDefined();
    expect(
      screen.getByRole('button', {
        name: /e-mail zum zurücksetzen senden/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('link', { name: /zurück zur anmeldung/i })
    ).toBeDefined();
  });

  it('displays the email input with correct attributes', () => {
    renderComponent();

    const emailInput = screen.getByRole('textbox');
    expect(emailInput.getAttribute('type')).toBe('email');
    expect(emailInput.getAttribute('placeholder')).toBe(
      'Geben Sie Ihre E-Mail-Adresse ein'
    );
    expect(emailInput.getAttribute('autocomplete')).toBe('email');
    expect(emailInput.getAttribute('required')).toBe('');
  });

  it('calls onEmailChange when email input changes', () => {
    const mockOnEmailChange = vi.fn();
    renderComponent({ onEmailChange: mockOnEmailChange });

    const emailInput = screen.getByRole('textbox');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(mockOnEmailChange).toHaveBeenCalledWith('test@example.com');
  });

  it('calls onSubmit when form is submitted', () => {
    const mockOnSubmit = vi.fn();
    const { container } = renderComponent({
      onSubmit: mockOnSubmit,
      email: 'test@example.com',
    });

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('disables submit button when email is empty', () => {
    renderComponent({ email: '' });

    const submitButton = screen.getByRole('button', {
      name: /e-mail zum zurücksetzen senden/i,
    });
    expect(submitButton.getAttribute('disabled')).toBe('');
  });

  it('disables submit button when hasEmailError is true', () => {
    renderComponent({
      email: 'test@example.com',
      hasEmailError: true,
    });

    const submitButton = screen.getByRole('button', {
      name: /e-mail zum zurücksetzen senden/i,
    });
    expect(submitButton.getAttribute('disabled')).toBe('');
  });

  it('disables submit button when loading is true', () => {
    renderComponent({
      email: 'test@example.com',
      loading: true,
    });

    const submitButton = screen.getByRole('button', {
      name: /e-mail zum zurücksetzen senden/i,
    });
    expect(submitButton.getAttribute('disabled')).toBe('');
  });

  it('shows loading state with spinner when loading is true', () => {
    renderComponent({ loading: true });

    expect(screen.getByText('E-Mail zum Zurücksetzen senden...')).toBeDefined();
    expect(
      screen
        .getByText('E-Mail zum Zurücksetzen senden...')
        .closest('button')
        ?.querySelector('svg')
    ).toBeDefined();
  });

  it('displays error message when error prop is provided', () => {
    renderComponent({ error: 'Email not found' });

    const errorMessage = screen.getByText('Email not found');
    expect(errorMessage).toBeDefined();
    expect(errorMessage.getAttribute('role')).toBe('alert');
    expect(errorMessage.className).toContain('bg-red-50');
  });

  it('displays email validation error when emailError prop is provided', () => {
    renderComponent({ emailError: 'Ungültiges E-Mail-Format' });

    expect(screen.getByText('Ungültiges E-Mail-Format')).toBeDefined();
  });

  it('shows help text', () => {
    renderComponent();

    expect(screen.getByText(/Brauchen Sie Hilfe\?/)).toBeDefined();
  });

  it('renders back to login link', () => {
    renderComponent();

    expect(
      screen.getByRole('link', { name: /zurück zur anmeldung/i })
    ).toBeDefined();
  });

  it('renders email input with correct placeholder', () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText(
      'Geben Sie Ihre E-Mail-Adresse ein'
    );
    expect(emailInput).toBeDefined();
  });

  it('enables submit button when email is provided and no errors', () => {
    renderComponent({
      email: 'test@example.com',
      hasEmailError: false,
      loading: false,
    });

    const submitButton = screen.getByRole('button', {
      name: /e-mail zum zurücksetzen senden/i,
    });
    expect(submitButton.getAttribute('disabled')).toBeNull();
  });

  it('applies noValidate attribute to form', () => {
    const { container } = renderComponent();

    const form = container.querySelector('form');
    expect(form?.getAttribute('novalidate')).toBe('');
  });

  it('renders back to login link with correct href', () => {
    renderComponent();

    const loginLink = screen.getByRole('link', {
      name: /zurück zur anmeldung/i,
    });
    expect(loginLink.getAttribute('href')).toBe('/login');
  });
});
