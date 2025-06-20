import React from 'react';
import { Outlet } from 'react-router';
import { AuthUIProvider } from '../contexts/auth-ui';

/**
 * Authentication layout for login, forgot password, and other auth-related pages
 * Features a dark background without navigation and provides auth UI state management
 */
export default function AuthLayout() {
  return (
    <AuthUIProvider>
      <div className="min-h-screen bg-[#061421]">
        <Outlet />
      </div>
    </AuthUIProvider>
  );
}
