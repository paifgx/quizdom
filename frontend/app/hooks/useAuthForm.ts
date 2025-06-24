import { useState, useCallback, useMemo } from 'react';
import { useFormValidation } from './useFormValidation';

export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
}

/**
 * Custom hook for managing authentication form state and validation
 */
export function useAuthForm(isSignupMode: boolean) {
  const [formState, setFormState] = useState<AuthFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });

  const { validateField, hasError, getError, clearErrors } =
    useFormValidation();

  const handleFieldChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormState(prev => {
        const newState = { ...prev, [field]: value };

        // Handle validation with current state values
        if (typeof value === 'string') {
          if (field === 'password' && isSignupMode && prev.confirmPassword) {
            validateField('confirmPassword', prev.confirmPassword, value);
          }
          validateField(
            field as string,
            value,
            field === 'confirmPassword' ? prev.password : undefined
          );
        }

        return newState;
      });
    },
    [validateField, isSignupMode]
  );

  const isFormValid = useMemo(() => {
    const { email, password, confirmPassword } = formState;

    if (!email || !password || hasError('email') || hasError('password'))
      return false;

    if (isSignupMode) {
      if (!confirmPassword) return false;
      if (hasError('confirmPassword')) return false;
    }

    return true;
  }, [formState, hasError, isSignupMode]);

  const resetForm = useCallback(() => {
    setFormState({
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    });
    clearErrors();
  }, [clearErrors]);

  return {
    formState,
    handleFieldChange,
    isFormValid,
    resetForm,
    hasError,
    getError,
    clearErrors,
  };
}
