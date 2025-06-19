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

  const getPasswordStrength = useCallback(
    (password: string): PasswordStrength => {
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
    []
  );

  const validateField = useCallback(
    (name: string, value: string, confirmValue?: string): boolean => {
      let isValid = true;

      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };

        switch (name) {
          case 'email':
            if (!value) {
              newErrors.email = 'Email is required';
              isValid = false;
            } else if (!validateEmail(value)) {
              newErrors.email = 'Please enter a valid email address';
              isValid = false;
            } else {
              delete newErrors.email;
            }
            break;

          case 'password':
            if (!value) {
              newErrors.password = 'Password is required';
              isValid = false;
            } else if (!validatePassword(value)) {
              newErrors.password = 'Password must be at least 6 characters';
              isValid = false;
            } else {
              delete newErrors.password;
            }
            break;

          case 'confirmPassword':
            if (!value) {
              newErrors.confirmPassword = 'Please confirm your password';
              isValid = false;
            } else if (value !== confirmValue) {
              newErrors.confirmPassword = 'Passwords do not match';
              isValid = false;
            } else {
              delete newErrors.confirmPassword;
            }
            break;

          case 'firstName':
            if (!value) {
              newErrors.firstName = 'First name is required';
              isValid = false;
            } else if (value.length < 2) {
              newErrors.firstName = 'First name must be at least 2 characters';
              isValid = false;
            } else {
              delete newErrors.firstName;
            }
            break;

          case 'lastName':
            if (!value) {
              newErrors.lastName = 'Last name is required';
              isValid = false;
            } else if (value.length < 2) {
              newErrors.lastName = 'Last name must be at least 2 characters';
              isValid = false;
            } else {
              delete newErrors.lastName;
            }
            break;
        }

        return newErrors;
      });

      return isValid;
    },
    [validateEmail, validatePassword]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    getPasswordStrength,
    clearErrors,
    hasError: (field: string) => !!errors[field],
    getError: (field: string) => errors[field],
  };
}
