import React from "react";
import { Outlet } from "react-router";

/**
 * Authentication layout for login, forgot password, and other auth-related pages
 * Features a dark background without navigation
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#061421]">
      <Outlet />
    </div>
  );
} 