import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/auth';

interface NavigationLink {
  label: string;
  path: string;
  role?: 'player' | 'admin';
  icon?: string;
}

const playerNavLinks: NavigationLink[] = [
  { label: 'Start', path: '/', role: 'player' },
  { label: 'Quizübersicht', path: '/quizzes', role: 'player' },
  { label: 'Spielmodi', path: '/game-modes', role: 'player' },
  { label: 'Fortschritt', path: '/progress', role: 'player' },
  { label: 'Profil', path: '/profile', role: 'player' },
];

const adminNavLinks: NavigationLink[] = [
  { label: 'Dashboard', path: '/admin/dashboard', role: 'admin' },
  { label: 'Fragen', path: '/admin/questions', role: 'admin' },
  { label: 'Users', path: '/admin/users', role: 'admin' },
  { label: 'Logs', path: '/admin/logs', role: 'admin' },
];

export function MainNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    activeRole: _activeRole, 
    isViewingAsAdmin, 
    logout, 
    switchToAdminView, 
    switchToPlayerView 
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  // Get navigation links based on active role
  const getNavLinks = () => {
    return isViewingAsAdmin ? adminNavLinks : playerNavLinks;
  };

  // Handle role switching with navigation
  const handleSwitchToAdminView = () => {
    switchToAdminView(navigate, location.pathname);
  };

  const handleSwitchToPlayerView = () => {
    switchToPlayerView(navigate, location.pathname);
  };

  if (!isAuthenticated) {
    return (
      <nav role="navigation" aria-label="Main navigation" className="bg-[#061421] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/logo/miniLogo.png"
                alt="Quizdom Logo"
                className="h-8 w-8"
              />
              <span className="text-[#FCC822] text-xl font-bold">QUIZDOM</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-[#FCC822] transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn-gradient px-4 py-2 rounded text-sm font-medium transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav role="navigation" aria-label="Main navigation" className="bg-[#061421] border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo/miniLogo.png"
              alt="Quizdom Logo"
              className="h-8 w-8"
            />
            <span className="text-[#FCC822] text-xl font-bold">QUIZDOM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links based on active role */}
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActiveLink(link.path)
                    ? 'nav-link-active'
                    : 'text-gray-300 hover:text-[#FCC822]'
                }`}
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Avatar and Info */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <img
                  src="/wisecoin/wisecoin.png"
                  alt="Wisecoins"
                  className="h-5 w-5"
                />
                <span className="text-[#FCC822] text-sm font-medium">
                  {user?.wisecoins || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar || '/avatars/player_male_with_greataxe.png'}
                  alt={`${user?.username} Avatar`}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-white text-sm font-medium">
                  {user?.username}
                </span>
                {isAdmin && (
                  <button
                    onClick={isViewingAsAdmin ? handleSwitchToPlayerView : handleSwitchToAdminView}
                    className={`flex items-center space-x-1 text-white text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 hover:scale-105 cursor-pointer border ${
                      isViewingAsAdmin 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-purple-400 hover:border-purple-300' 
                        : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border-green-400 hover:border-green-300'
                    }`}
                    title={`Currently in ${isViewingAsAdmin ? 'admin' : 'player'} mode. Click to switch to ${isViewingAsAdmin ? 'player' : 'admin'} view.`}
                  >
                    <span>{isViewingAsAdmin ? 'admin' : 'player'}</span>
                    <svg
                      className="w-3 h-3 opacity-80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-300 hover:text-[#FCC822] transition-colors duration-200"
                aria-label="Logout"
              >
                <img
                  src="/buttons/Logout.png"
                  alt="Logout"
                  className="h-5 w-5"
                />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-[#FCC822] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 rounded-b-lg">


              {/* Navigation Links based on active role */}
              {getNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                    isActiveLink(link.path)
                      ? 'bg-gray-700 text-[#FCC822]'
                      : 'text-gray-300 hover:text-[#FCC822] hover:bg-gray-700'
                  }`}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="border-t border-gray-700 pt-4 pb-3">
                <div className="flex items-center px-3 space-x-3">
                  <img
                    src={user?.avatar || '/avatars/player_male_with_greataxe.png'}
                    alt={`${user?.username} Avatar`}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="text-base font-medium text-white">
                        {user?.username}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={isViewingAsAdmin ? handleSwitchToPlayerView : handleSwitchToAdminView}
                          className={`flex items-center space-x-1 text-white text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 hover:scale-105 cursor-pointer border ${
                            isViewingAsAdmin 
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-purple-400 hover:border-purple-300' 
                              : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border-green-400 hover:border-green-300'
                          }`}
                          title={`Currently in ${isViewingAsAdmin ? 'admin' : 'player'} mode. Click to switch to ${isViewingAsAdmin ? 'player' : 'admin'} view.`}
                        >
                          <span>{isViewingAsAdmin ? 'admin' : 'player'}</span>
                          <svg
                            className="w-3 h-3 opacity-80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <img
                        src="/wisecoin/wisecoin.png"
                        alt="Wisecoins"
                        className="h-4 w-4"
                      />
                      <span className="text-[#FCC822] text-sm">
                        {user?.wisecoins || 0} Wisecoins
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-300 hover:text-[#FCC822] hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    <img
                      src="/buttons/Logout.png"
                      alt=""
                      className="h-5 w-5 mr-2"
                    />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 