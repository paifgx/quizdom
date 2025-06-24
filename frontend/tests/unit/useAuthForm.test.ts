import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthForm } from '../../app/hooks/useAuthForm';

describe('useAuthForm', () => {
  it('initializes with empty form state', () => {
    const { result } = renderHook(() => useAuthForm(false));

    expect(result.current.formState.email).toBe('');
    expect(result.current.formState.password).toBe('');
    expect(result.current.formState.confirmPassword).toBe('');
    expect(result.current.formState.rememberMe).toBe(false);
  });

  it('updates field values when handleFieldChange is called', () => {
    const { result } = renderHook(() => useAuthForm(false));

    act(() => {
      result.current.handleFieldChange('email', 'test@example.com');
    });

    expect(result.current.formState.email).toBe('test@example.com');
  });

  it('validates form correctly for login mode', () => {
    const { result } = renderHook(() => useAuthForm(false));

    // Initially invalid
    expect(result.current.isFormValid).toBe(false);

    act(() => {
      result.current.handleFieldChange('email', 'test@example.com');
      result.current.handleFieldChange('password', 'password123');
    });

    // Should be valid with email and password
    expect(result.current.isFormValid).toBe(true);
  });

  it('validates form correctly for signup mode', () => {
    const { result } = renderHook(() => useAuthForm(true));

    // Initially invalid
    expect(result.current.isFormValid).toBe(false);

    act(() => {
      result.current.handleFieldChange('email', 'test@example.com');
      result.current.handleFieldChange('password', 'password123');
      result.current.handleFieldChange('confirmPassword', 'password123');
    });

    // Should be valid with all required fields
    expect(result.current.isFormValid).toBe(true);
  });

  it('resets form when resetForm is called', () => {
    const { result } = renderHook(() => useAuthForm(false));

    act(() => {
      result.current.handleFieldChange('email', 'test@example.com');
      result.current.handleFieldChange('password', 'password123');
    });

    expect(result.current.formState.email).toBe('test@example.com');

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formState.email).toBe('');
    expect(result.current.formState.password).toBe('');
  });
});
