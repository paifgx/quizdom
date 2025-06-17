import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/auth';

export function meta() {
  return [
    { title: 'Login | Quizdom' },
    { name: 'description', content: 'Melden Sie sich bei Quizdom an.' },
  ];
}

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

  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Redirect logic after login
  if (isAuthenticated && user) {
    const from = (location.state as any)?.from?.pathname;
    
    // If no specific redirect requested, send admins to admin dashboard, players to home
    if (!from) {
      const defaultRoute = user.role === 'admin' ? '/admin/dashboard' : '/';
      return <Navigate to={defaultRoute} replace />;
    }
    
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignupMode) {
        // Handle signup logic
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        // TODO: Implement signup API call
        console.log('Signup:', { email, password, firstName, lastName });
        setError('Signup functionality coming soon!');
      } else {
        // Handle login logic
        await login(email, password);
      }
    } catch (err) {
      setError(isSignupMode ? 'Signup failed. Please try again.' : 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="min-h-screen bg-[#061421] flex overflow-hidden relative">
      {/* Form Container - slides left/right based on mode */}
      <div className={`flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white transition-all duration-700 ease-out transform ${
        isSignupMode ? 'translate-x-full' : 'translate-x-0'
      }`}>
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 transition-all duration-500">
              {isSignupMode ? 'Create Account!' : 'Welcome back!'}
            </h2>
            <p className="text-gray-600 transition-all duration-500">
              {isSignupMode ? 'Please fill in your details to signup.' : 'Please login/Signup to your account.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          {/* Login/Signup Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {isSignupMode && (
                <div className="grid grid-cols-2 gap-4 animate-slide-down">
                  <div>
                    <label htmlFor="firstName" className="sr-only">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent focus:z-10 transition-all duration-300"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="sr-only">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent focus:z-10 transition-all duration-300"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent focus:z-10 transition-all duration-300"
                  placeholder="test@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignupMode ? "new-password" : "current-password"}
                  required
                  className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent focus:z-10 transition-all duration-300"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {isSignupMode && (
                <div className="animate-slide-down">
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent focus:z-10 transition-all duration-300"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                disabled={loading}
                className="btn-gradient w-full py-3 px-4 rounded-lg text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-95"
              >
                {loading ? (isSignupMode ? 'Creating Account...' : 'Logging in...') : (isSignupMode ? 'Create Account' : 'Login')}
              </button>

              <button
                type="button"
                onClick={toggleMode}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 bg-white rounded-lg text-base font-medium hover:bg-gray-50 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
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
      <div className={`hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#061421] to-gray-900 transition-all duration-700 ease-out transform ${
        isSignupMode ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <div className="text-center transition-all duration-700 ease-in-out">
          <img
            src="/logo/Logo_Quizdom_transparent.png"
            alt="Quizdom Logo"
            className="h-64 w-64 mx-auto mb-8 opacity-90 transition-all duration-700 hover:scale-110"
          />
          <h1 className="text-4xl font-bold text-[#FCC822] mb-4 transition-all duration-700">QUIZDOM</h1>
          <p className="text-xl text-gray-300 transition-all duration-700">Rise of the Wise</p>
        </div>
      </div>
    </div>
  );
} 