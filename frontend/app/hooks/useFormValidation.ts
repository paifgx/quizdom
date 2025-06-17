import { useState, useCallback } from 'react';

export interface ValidationErrors {
  [key: string]: string;
}

export interface PasswordStrength {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
}

/**
 * Custom hook for form validation with real-time feedback
 * Provides validation logic and error state management
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePassword = useCallback((password: string): boolean => {
    return password.length >= 6;
  }, []);

  const getPasswordStrength = useCallback((password: string): PasswordStrength => {
    if (password.length < 6) return { strength: 'weak', score: 0 };
    if (password.length < 8) return { strength: 'fair', score: 1 };
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return { strength: 'good', score: 2 };
    }
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 'strong', score: 3 };
    }
    return { strength: 'fair', score: 1 };
  }, []);

  const validateField = useCallback((name: string, value: string, confirmValue?: string): boolean => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (!validatePassword(value)) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== confirmValue) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'firstName':
        if (!value) {
          newErrors.firstName = 'First name is required';
        } else if (value.length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;
        
      case 'lastName':
        if (!value) {
          newErrors.lastName = 'Last name is required';
        } else if (value.length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.lastName;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors, validateEmail, validatePassword]);

  return {
    errors,
    validateField,
    getPasswordStrength,
    clearErrors: () => setErrors({}),
    hasError: (field: string) => !!errors[field],
    getError: (field: string) => errors[field]
  };
} 