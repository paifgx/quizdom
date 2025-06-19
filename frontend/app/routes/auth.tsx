import React, { useState, useCallback, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/auth";
import { useAuthForm } from "../hooks/useAuthForm";
import {
  AuthPageLayout,
  LoginForm,
  SignupForm,
  LoadingSkeleton,
} from "../components";

export function meta() {
  return [
    { title: "Authentication | Quizdom" },
    { name: "description", content: "Login or create your Quizdom account." },
  ];
}

export default function AuthPage() {
  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Use internal state for smooth transitions
  const [isSignupMode, setIsSignupMode] = useState(
    location.pathname === "/signup"
  );

  const { formState, handleFieldChange, isFormValid, resetForm, getError } =
    useAuthForm(isSignupMode);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
        if (isSignupMode) {
          console.log("Signup:", formState);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setError("Signup functionality coming soon!");
          }, 2000);
        } else {
          await login(formState.email, formState.password);
        }
      } catch (err) {
        setError(
          isSignupMode
            ? "Signup failed. Please try again."
            : "Login failed. Please check your credentials."
        );
      } finally {
        setLoading(false);
      }
    },
    [isSignupMode, formState, login]
  );

  const toggleMode = useCallback(() => {
    const newMode = !isSignupMode;
    setIsSignupMode(newMode);
    setError("");
    setShowSuccess(false);
    // Navigate to the appropriate route
    navigate(newMode ? "/signup" : "/login");
  }, [isSignupMode, navigate]);

  useEffect(() => {
    resetForm();
    setError("");
    setShowSuccess(false);
  }, [isSignupMode, resetForm]);

  // Sync with URL changes
  useEffect(() => {
    setIsSignupMode(location.pathname === "/signup");
  }, [location.pathname]);

  if (isAuthenticated && user && !showSuccess) {
    const from =
      location.state?.from?.pathname ||
      (user.role === "admin" ? "/admin/dashboard" : "/");
    return <Navigate to={from} replace />;
  }

  if (loading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#061421] flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061421] relative overflow-hidden">
      {/* Container that holds both panels but shows only one at a time */}
      <div className="relative w-full h-screen">
        {/* Sliding Container - positioned absolutely to allow sliding */}
        <div
          className="absolute inset-0 flex w-[200%] transition-transform duration-700 ease-in-out"
          style={{
            transform: isSignupMode ? "translateX(-50%)" : "translateX(0%)",
          }}
        >
          {/* Login Panel (Shows when on /login) */}
          <div className="w-1/2 flex min-h-screen">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
              <div className="max-w-md w-full space-y-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back!
                  </h1>
                  <p className="text-gray-600">Please login to your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && !isSignupMode && (
                    <div
                      className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <LoginForm
                    email={formState.email}
                    password={formState.password}
                    rememberMe={formState.rememberMe}
                    loading={loading}
                    error={error}
                    isFormValid={isFormValid}
                    onEmailChange={(value) => handleFieldChange("email", value)}
                    onPasswordChange={(value) =>
                      handleFieldChange("password", value)
                    }
                    onRememberMeChange={(checked) =>
                      handleFieldChange("rememberMe", checked)
                    }
                    onSubmit={handleSubmit}
                    getError={getError}
                  />

                  {/* Login Actions */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-[#FCC822] focus:ring-[#FCC822] border-gray-300 bg-white rounded"
                          checked={formState.rememberMe || false}
                          onChange={(e) =>
                            handleFieldChange("rememberMe", e.target.checked)
                          }
                        />
                        <label
                          htmlFor="remember-me"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Remember Me
                        </label>
                      </div>
                      <a
                        href="/forgot-password"
                        className="text-[#FCC822] hover:text-[#FFCD2E] text-sm"
                      >
                        Forgot Password?
                      </a>
                    </div>

                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="btn-gradient w-full py-3 px-4 rounded-lg text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading && !isSignupMode ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Logging in...
                          </span>
                        ) : (
                          "Login"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={toggleMode}
                        className="w-full py-3 px-4 border border-gray-300 text-gray-700 bg-white rounded-lg text-base font-medium hover:bg-gray-50 transition-all duration-300"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">Demo Accounts:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>Player: player@quizdom.com</p>
                    <p>Admin: admin@quizdom.com</p>
                    <p>Password: any</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Container for Login (Right side) */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#061421] to-gray-900">
              <div className="text-center">
                <img
                  src="/logo/Logo_Quizdom_transparent.png"
                  alt="Quizdom Logo"
                  className="h-64 w-64 mx-auto mb-8 opacity-90 transition-all duration-700 hover:scale-110"
                />
                <h2 className="text-4xl font-bold text-[#FCC822] mb-4 transition-all duration-700">
                  QUIZDOM
                </h2>
                <p className="text-xl text-gray-300 transition-all duration-700">
                  Rise of the Wise
                </p>
              </div>
            </div>
          </div>

          {/* Signup Panel (Shows when on /signup) */}
          <div className="w-1/2 flex min-h-screen">
            {/* Logo Container for Signup (Left side) */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-gray-900 to-[#061421]">
              <div className="text-center">
                <img
                  src="/logo/Logo_Quizdom_transparent.png"
                  alt="Quizdom Logo"
                  className="h-64 w-64 mx-auto mb-8 opacity-90 transition-all duration-700 hover:scale-110"
                />
                <h2 className="text-4xl font-bold text-[#FCC822] mb-4 transition-all duration-700">
                  QUIZDOM
                </h2>
                <p className="text-xl text-gray-300 transition-all duration-700">
                  Rise of the Wise
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
              <div className="max-w-md w-full space-y-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create Account!
                  </h1>
                  <p className="text-gray-600">
                    Please fill in your details to signup.
                  </p>
                </div>

                {showSuccess && (
                  <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6">
                    Account created successfully! Redirecting...
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && isSignupMode && (
                    <div
                      className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <SignupForm
                    {...formState}
                    loading={loading}
                    error={error}
                    isFormValid={isFormValid}
                    onFieldChange={handleFieldChange}
                    onSubmit={handleSubmit}
                    getError={getError}
                  />

                  {/* Signup Actions */}
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className="btn-gradient w-full py-3 px-4 rounded-lg text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading && isSignupMode ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMode}
                      className="w-full py-3 px-4 border border-gray-300 text-gray-700 bg-white rounded-lg text-base font-medium hover:bg-gray-50 transition-all duration-300"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
