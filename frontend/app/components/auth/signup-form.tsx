import React from 'react';
import { ValidatedInput } from './validated-input';
import { PasswordStrengthIndicator } from './password-strength-indicator';
import { translate } from '../../utils/translations';

export interface SignupFormProps {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error?: string;
  isFormValid: boolean;
  onFieldChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  getError: (field: string) => string | undefined;
}

/**
 * Signup form component with email and password registration fields
 * Includes email, password, and confirmation with validation
 */
export function SignupForm({
  email,
  password,
  confirmPassword,
  onFieldChange,
  onSubmit: _onSubmit,
  getError,
}: SignupFormProps) {
  return (
    <div className="space-y-6">
      <ValidatedInput
        id="email"
        name="email"
        type="email"
        placeholder="test@mail.com"
        value={email}
        onChange={value => onFieldChange('email', value)}
        error={getError('email')}
        autoComplete="email"
        required
      />

      <div>
        <ValidatedInput
          id="password"
          name="password"
          type="password"
          placeholder={translate('auth.yourPassword')}
          value={password}
          onChange={value => onFieldChange('password', value)}
          error={getError('password')}
          autoComplete="new-password"
          required
        />
        <PasswordStrengthIndicator password={password} />
      </div>

      <ValidatedInput
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        placeholder={translate('auth.confirmPassword')}
        value={confirmPassword}
        onChange={value => onFieldChange('confirmPassword', value)}
        error={getError('confirmPassword')}
        autoComplete="new-password"
        required
      />
    </div>
  );
}
