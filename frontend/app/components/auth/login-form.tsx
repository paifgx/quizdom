import React from "react";
import { ValidatedInput } from "./validated-input";

export interface LoginFormProps {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  error?: string;
  isFormValid: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  getError: (field: string) => string | undefined;
}

export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  getError,
}: LoginFormProps) {
  return (
    <div className="space-y-6">
      <ValidatedInput
        id="email"
        name="email"
        type="email"
        placeholder="test@mail.com"
        value={email}
        onChange={onEmailChange}
        error={getError("email")}
        autoComplete="email"
        required
      />

      <ValidatedInput
        id="password"
        name="password"
        type="password"
        placeholder="Your password"
        value={password}
        onChange={onPasswordChange}
        error={getError("password")}
        autoComplete="current-password"
        required
      />
    </div>
  );
}
