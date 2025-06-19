import React from "react";
import { ValidatedInput } from "./validated-input";
import { PasswordStrengthIndicator } from "./password-strength-indicator";

export interface SignupFormProps {
  firstName: string;
  lastName: string;
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
 * Signup form component with all required user registration fields
 * Includes name, email, password, and confirmation with validation
 */
export function SignupForm({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  onFieldChange,
  onSubmit,
  getError,
}: SignupFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <ValidatedInput
          id="firstName"
          name="firstName"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(value) => onFieldChange("firstName", value)}
          error={getError("firstName")}
          required
        />
        <ValidatedInput
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(value) => onFieldChange("lastName", value)}
          error={getError("lastName")}
          required
        />
      </div>

      <ValidatedInput
        id="email"
        name="email"
        type="email"
        placeholder="test@mail.com"
        value={email}
        onChange={(value) => onFieldChange("email", value)}
        error={getError("email")}
        autoComplete="email"
        required
      />

      <div>
        <ValidatedInput
          id="password"
          name="password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(value) => onFieldChange("password", value)}
          error={getError("password")}
          autoComplete="new-password"
          required
        />
        <PasswordStrengthIndicator password={password} />
      </div>

      <ValidatedInput
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(value) => onFieldChange("confirmPassword", value)}
        error={getError("confirmPassword")}
        autoComplete="new-password"
        required
      />
    </div>
  );
}
