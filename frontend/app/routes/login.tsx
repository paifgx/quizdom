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
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      await login(email, password);
    } catch (err) {
      setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061421] flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-300">
              Please login/signup to your account.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                  className="relative block w-full px-4 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent focus:z-10"
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
                  autoComplete="current-password"
                  required
                  className="relative block w-full px-4 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent focus:z-10"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#FCC822] focus:ring-[#FCC822] border-gray-600 bg-gray-800 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
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

            {/* Submit Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <button
                type="button"
                className="w-full py-3 px-4 border border-gray-600 text-gray-300 bg-transparent rounded-lg text-base font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Signup
              </button>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>Player: player@quizdom.com</p>
              <p>Admin: admin@quizdom.com</p>
              <p>Password: any</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Logo */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#061421] to-gray-900">
        <div className="text-center">
          <img
            src="/logo/Logo_Quizdom_transparent.png"
            alt="Quizdom Logo"
            className="h-64 w-64 mx-auto mb-8 opacity-90"
          />
          <h1 className="text-4xl font-bold text-[#FCC822] mb-4">QUIZDOM</h1>
          <p className="text-xl text-gray-300">Rise of the Wise</p>
        </div>
      </div>
    </div>
  );
} 