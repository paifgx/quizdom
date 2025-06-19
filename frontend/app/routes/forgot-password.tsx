import React, { useState, useCallback } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { AuthPageLayout } from '../components/ui/page-layout';
import { ForgotPasswordForm } from '../components/auth/forgot-password-form';
import { ForgotPasswordSuccess } from '../components/auth/forgot-password-success';

export function meta() {
  return [
    { title: 'Forgot Password | Quizdom' },
    { name: 'description', content: 'Reset your Quizdom password.' },
  ];
}

/**
 * Forgot password page with email input and reset functionality
 * Maintains consistent design with login page
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { validateField, getError, hasError } = useFormValidation();

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      validateField('email', value);
      setError(''); // Clear previous errors
    },
    [validateField]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before submission
    const emailValid = validateField('email', email);

    if (!emailValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement forgot password API call
      // console.log('Password reset requested for:', email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setError('');
    setSuccess(false);
  };

  return (
    <AuthPageLayout>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </h1>
        <p className="text-gray-600">
          {success
            ? 'Check your email for reset instructions.'
            : "Enter your email address and we'll send you a link to reset your password."}
        </p>
      </div>

      {/* Conditional Content */}
      {success ? (
        <ForgotPasswordSuccess email={email} onSendAnother={resetForm} />
      ) : (
        <ForgotPasswordForm
          email={email}
          onEmailChange={handleEmailChange}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          emailError={getError('email')}
          hasEmailError={hasError('email')}
        />
      )}
    </AuthPageLayout>
  );
}
