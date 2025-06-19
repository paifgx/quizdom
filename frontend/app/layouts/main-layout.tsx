import React from "react";
import { Outlet } from "react-router";
import { MainNav } from "../components/navigation/main-nav";
import { useBackgroundImage } from "../hooks/useBackgroundImage";

/**
 * Main layout component that provides consistent navigation and background
 * for all authenticated application routes. Automatically sets route-based backgrounds
 * but allows components to override the background dynamically.
 */
export default function MainLayout() {
  const { backgroundImage } = useBackgroundImage();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Subtle overlay to reduce background prominence */}
      <div className="absolute inset-0 bg-[#061421]/50"></div>

      {/* Content container */}
      <div className="relative z-10">
        <MainNav />
        <Outlet />
      </div>
    </div>
  );
} 