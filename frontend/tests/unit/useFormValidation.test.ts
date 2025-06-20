import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../../app/hooks/useFormValidation';

describe('useFormValidation', () => {
  describe('validateField', () => {
    it('validates email correctly', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateField('email', '');
      });
      expect(result.current.getError('email')).toBe('E-Mail ist erforderlich');

      act(() => {
        result.current.validateField('email', 'invalid-email');
      });
      expect(result.current.getError('email')).toBe(
        'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      );

      act(() => {
        result.current.validateField('email', 'valid@example.com');
      });
      expect(result.current.getError('email')).toBeUndefined();
    });

    it('validates password correctly', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateField('password', '');
      });
      expect(result.current.getError('password')).toBe(
        'Passwort ist erforderlich'
      );

      act(() => {
        result.current.validateField('password', '12345');
      });
      expect(result.current.getError('password')).toBe(
        'Passwort muss mindestens 6 Zeichen lang sein'
      );

      act(() => {
        result.current.validateField('password', '123456');
      });
      expect(result.current.getError('password')).toBeUndefined();
    });

    it('validates confirmPassword correctly', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateField('confirmPassword', '');
      });
      expect(result.current.getError('confirmPassword')).toBe(
        'Bitte bestätigen Sie Ihr Passwort'
      );

      act(() => {
        result.current.validateField(
          'confirmPassword',
          'different',
          'password123'
        );
      });
      expect(result.current.getError('confirmPassword')).toBe(
        'Passwörter stimmen nicht überein'
      );

      act(() => {
        result.current.validateField(
          'confirmPassword',
          'password123',
          'password123'
        );
      });
      expect(result.current.getError('confirmPassword')).toBeUndefined();
    });

    it('validates firstName correctly', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateField('firstName', '');
      });
      expect(result.current.getError('firstName')).toBe(
        'Vorname ist erforderlich'
      );

      act(() => {
        result.current.validateField('firstName', 'J');
      });
      expect(result.current.getError('firstName')).toBe(
        'Vorname muss mindestens 2 Zeichen lang sein'
      );

      act(() => {
        result.current.validateField('firstName', 'John');
      });
      expect(result.current.getError('firstName')).toBeUndefined();
    });

    it('validates lastName correctly', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateField('lastName', '');
      });
      expect(result.current.getError('lastName')).toBe(
        'Nachname ist erforderlich'
      );

      act(() => {
        result.current.validateField('lastName', 'D');
      });
      expect(result.current.getError('lastName')).toBe(
        'Nachname muss mindestens 2 Zeichen lang sein'
      );

      act(() => {
        result.current.validateField('lastName', 'Doe');
      });
      expect(result.current.getError('lastName')).toBeUndefined();
    });
  });

  describe('getPasswordStrength', () => {
    it('returns weak for passwords under 6 characters', () => {
      const { result } = renderHook(() => useFormValidation());

      expect(result.current.getPasswordStrength('12345')).toEqual({
        strength: 'weak',
        score: 0,
      });
    });

    it('returns fair for passwords 6-7 characters', () => {
      const { result } = renderHook(() => useFormValidation());

      expect(result.current.getPasswordStrength('123456')).toEqual({
        strength: 'fair',
        score: 1,
      });
    });

    it('returns good for passwords 8+ characters with upper and lowercase', () => {
      const { result } = renderHook(() => useFormValidation());

      expect(result.current.getPasswordStrength('Password')).toEqual({
        strength: 'good',
        score: 2,
      });
    });

    it('returns strong for passwords with upper, lower, and numbers', () => {
      const { result } = renderHook(() => useFormValidation());

      expect(result.current.getPasswordStrength('Password123')).toEqual({
        strength: 'strong',
        score: 3,
      });
    });
  });

  describe('utility methods', () => {
    it('hasError returns correct boolean', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateField('email', '');
      });

      expect(result.current.hasError('email')).toBe(true);
      expect(result.current.hasError('password')).toBe(false);
    });

    it('clearErrors removes all errors', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateField('email', '');
        result.current.validateField('password', '');
      });

      expect(result.current.hasError('email')).toBe(true);
      expect(result.current.hasError('password')).toBe(true);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.hasError('email')).toBe(false);
      expect(result.current.hasError('password')).toBe(false);
    });
  });
});
