import React from 'react';
import { Outlet } from 'react-router';
import { useAuth } from '../contexts/auth';
import { HomeLoading } from '../components/ui/home-loading';

/**
 * Shared dashboard layout with sidebar for dashboard and topic detail pages
 * Contains the common sidebar elements: online users, achievements, and wisecoins
 * Only renders when user is authenticated to prevent flashing
 */
export default function DashboardLayout() {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <HomeLoading />;
  }

  // If not authenticated, render outlet without sidebar (let route handle redirect)
  if (!isAuthenticated) {
    return <Outlet />;
  }

  const onlineUsers = [
    {
      id: '1',
      username: 'max_player',
      avatar: '/avatars/player_male_with_greataxe.png',
    },
    {
      id: '2',
      username: 'anna_wizard',
      avatar: '/avatars/ai_assistant_wizard.png',
    },
    {
      id: '3',
      username: 'peter_knight',
      avatar: '/avatars/player_male_with_greataxe.png',
    },
    {
      id: '4',
      username: 'sarah_mage',
      avatar: '/avatars/ai_assistant_wizard.png',
    },
  ];

  const achievements = [
    { id: '1', title: 'First Quiz', badge: '/badges/badge_book_1.png' },
    { id: '2', title: 'Quiz Master', badge: '/badges/badge_book_2.png' },
  ];

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 gap-6 lg:gap-8">
      {/* Main Content - This will be filled by the Outlet */}
      <div className="flex-1 order-1">
        <Outlet />
      </div>

      {/* Shared Sidebar */}
      <div className="w-full lg:w-80 space-y-4 sm:space-y-6 order-2">
        {/* Online Users */}
        <div className="bg-gray-800/80 rounded-xl p-4 sm:p-6 border border-gray-600 backdrop-blur-sm">
          <h3 className="text-[#FCC822] font-bold text-base sm:text-lg mb-3 sm:mb-4">
            Other Users Online
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {onlineUsers.slice(0, 6).map(onlineUser => (
              <div
                key={onlineUser.id}
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <img
                  src={onlineUser.avatar}
                  alt={onlineUser.username}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-green-400"
                />
                <span className="text-white text-xs sm:text-sm font-medium flex-1 truncate">
                  {onlineUser.username}
                </span>
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              </div>
            ))}
            {onlineUsers.length > 6 && (
              <div className="text-center pt-2">
                <span className="text-[#FCC822] text-xs sm:text-sm font-medium">
                  20+
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gray-800/80 rounded-xl p-4 sm:p-6 border border-gray-600 backdrop-blur-sm">
          <h3 className="text-[#FCC822] font-bold text-base sm:text-lg mb-3 sm:mb-4">
            Achievements
          </h3>
          <div className="flex justify-center space-x-2 sm:space-x-3">
            {achievements.map(achievement => (
              <div key={achievement.id} className="flex flex-col items-center">
                <img
                  src={achievement.badge}
                  alt={achievement.title}
                  className="h-10 w-10 sm:h-12 sm:w-12 mb-1 sm:mb-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Current Wisecoins */}
        <div className="bg-gray-800/80 rounded-xl p-4 sm:p-6 border border-gray-600 backdrop-blur-sm">
          <h3 className="text-[#FCC822] font-bold text-base sm:text-lg mb-3 sm:mb-4">
            Belohnungen
          </h3>
          <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
            <img
              src="/wisecoin/wisecoin.png"
              alt="Wisecoins"
              className="h-6 w-6 sm:h-8 sm:w-8"
            />
            <span className="text-[#FCC822] text-lg sm:text-2xl font-bold">
              {user?.wisecoins || 0} Wisecoins
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
