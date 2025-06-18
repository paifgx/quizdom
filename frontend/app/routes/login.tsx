import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/auth';
import { useFormValidation } from '../hooks/useFormValidation';
import { ValidatedInput } from '../components/auth/validated-input';
import { PasswordStrengthIndicator } from '../components/auth/password-strength-indicator';
import { LoadingSkeleton } from '../components/ui/loading-skeleton';

export function meta({ params }: { params?: any }) {
  const mode = params?.mode || 'login';
  return [
    { title: `${mode === 'signup' ? 'Sign Up' : 'Login'} | Quizdom` },
    { name: 'description', content: mode === 'signup' ? 'Create your Quizdom account.' : 'Melden Sie sich bei Quizdom an.' },
  ];
}

/**
 * Login and signup page with smooth transitions and validation
 * Handles both authentication modes with enhanced UX
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    validateField,
    getPasswordStrength,
    clearErrors,
    hasError,
    getError
  } = useFormValidation();

  // Memoized values for performance optimization
  const passwordStrength = useMemo(() =>
    isSignupMode ? getPasswordStrength(password) : null
    , [password, isSignupMode, getPasswordStrength]);

  const isFormValid = useMemo(() => {
    if (!email || !password) return false;
    if (hasError('email') || hasError('password')) return false;

    if (isSignupMode) {
      if (!firstName || !lastName || !confirmPassword) return false;
      if (hasError('firstName') || hasError('lastName') || hasError('confirmPassword')) return false;
    }

    return true;
  }, [email, password, firstName, lastName, confirmPassword, hasError, isSignupMode]);

  // Handle field changes with validation
  const handleFieldChange = useCallback((field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        validateField('email', value);
        break;
      case 'password':
        setPassword(value);
        validateField('password', value);
        if (isSignupMode && confirmPassword) {
          validateField('confirmPassword', confirmPassword, value);
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        validateField('confirmPassword', value, password);
        break;
      case 'firstName':
        setFirstName(value);
        validateField('firstName', value);
        break;
      case 'lastName':
        setLastName(value);
        validateField('lastName', value);
        break;
    }
  }, [validateField, password, confirmPassword, isSignupMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    let signupFieldsValid = true;

    if (isSignupMode) {
      const firstNameValid = validateField('firstName', firstName);
      const lastNameValid = validateField('lastName', lastName);
      const confirmPasswordValid = validateField('confirmPassword', confirmPassword, password);
      signupFieldsValid = firstNameValid && lastNameValid && confirmPasswordValid;
    }

    if (!emailValid || !passwordValid || !signupFieldsValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignupMode) {
        // TODO: Implement signup API call
        console.log('Signup:', { email, password, firstName, lastName });
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setError('Signup functionality coming soon!');
        }, 2000);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(isSignupMode ? 'Signup failed. Please try again.' : 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = useCallback(() => {
    setIsSignupMode(!isSignupMode);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    clearErrors();
    setShowSuccess(false);

    // Focus management for accessibility
    setTimeout(() => {
      const firstInput = formRef.current?.querySelector('input');
      firstInput?.focus();
    }, 100);
  }, [isSignupMode, clearErrors]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSignupMode) {
        toggleMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSignupMode, toggleMode]);

  // Handle redirect after successful authentication
  if (isAuthenticated && user && !showSuccess) {
    const from = location.state?.from?.pathname || (user.role === 'admin' ? '/admin/dashboard' : '/');
    return <Navigate to={from} replace />;
  }

  // Show loading skeleton during authentication
  if (loading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#061421] flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061421] flex overflow-hidden relative">
      {/* Form Container - slides left/right based on mode */}
      <div className={`flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white transition-all duration-700 ease-out transform ${isSignupMode ? 'translate-x-full' : 'translate-x-0'
        }`}>
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 transition-all duration-500">
              {isSignupMode ? 'Create Account!' : 'Welcome back!'}
            </h1>
            <p className="text-gray-600 transition-all duration-500">
              {isSignupMode ? 'Please fill in your details to signup.' : 'Please login/Signup to your account.'}
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg animate-fade-in">
              Account created successfully! Redirecting...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg animate-fade-in" role="alert">
              {error}
            </div>
          )}

          {/* Login/Signup Form */}
          <form ref={formRef} className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {isSignupMode && (
                <div className="grid grid-cols-2 gap-4 animate-slide-down">
                  <ValidatedInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(value) => handleFieldChange('firstName', value)}
                    error={getError('firstName')}
                    required
                  />
                  <ValidatedInput
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(value) => handleFieldChange('lastName', value)}
                    error={getError('lastName')}
                    required
                  />
                </div>
              )}

              <ValidatedInput
                id="email"
                name="email"
                type="email"
                placeholder="test@mail.com"
                value={email}
                onChange={(value) => handleFieldChange('email', value)}
                error={getError('email')}
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
                  onChange={(value) => handleFieldChange('password', value)}
                  error={getError('password')}
                  autoComplete={isSignupMode ? "new-password" : "current-password"}
                  required
                />
                {isSignupMode && <PasswordStrengthIndicator password={password} />}
              </div>

              {isSignupMode && (
                <div className="animate-slide-down">
                  <ValidatedInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(value) => handleFieldChange('confirmPassword', value)}
                    error={getError('confirmPassword')}
                    autoComplete="new-password"
                    required
                  />
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            {!isSignupMode && (
              <div className="flex items-center justify-between animate-fade-in">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#FCC822] focus:ring-[#FCC822] border-gray-300 bg-white rounded transition-all duration-300"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember Me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-[#FCC822] hover:text-[#FFCD2E] transition-colors duration-200"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="btn-gradient w-full py-3 px-4 rounded-lg text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-95"
                aria-describedby={!isFormValid ? "form-validation-error" : undefined}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isSignupMode ? 'Creating Account...' : 'Logging in...'}
                  </span>
                ) : (
                  isSignupMode ? 'Create Account' : 'Login'
                )}
              </button>

              <button
                type="button"
                onClick={toggleMode}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 bg-white rounded-lg text-base font-medium hover:bg-gray-50 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                aria-label={isSignupMode ? 'Switch to login mode' : 'Switch to signup mode'}
              >
                {isSignupMode ? 'Back to Login' : 'Signup'}
              </button>
            </div>
          </form>

          {/* Demo Accounts - Only show in login mode */}
          {!isSignupMode && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fade-in">
              <p className="text-sm text-gray-700 mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Player: player@quizdom.com</p>
                <p>Admin: admin@quizdom.com</p>
                <p>Password: any</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logo Container - slides right/left based on mode */}
      <div className={`hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#061421] to-gray-900 transition-all duration-700 ease-out transform ${isSignupMode ? '-translate-x-full' : 'translate-x-0'
        }`}>
        <div className="text-center transition-all duration-700 ease-in-out">
          <img
            src="/logo/Logo_Quizdom_transparent.png"
            alt="Quizdom Logo"
            className="h-64 w-64 mx-auto mb-8 opacity-90 transition-all duration-700 hover:scale-110"
          />
          <h2 className="text-4xl font-bold text-[#FCC822] mb-4 transition-all duration-700">QUIZDOM</h2>
          <p className="text-xl text-gray-300 transition-all duration-700">Rise of the Wise</p>
        </div>
      </div>
    </div>
  );
} 