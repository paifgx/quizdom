import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/auth';
import { translate } from '../../utils/translations';

interface NavigationLink {
  label: string;
  path: string;
  role?: 'player' | 'admin';
  icon?: string;
}

const playerNavLinks: NavigationLink[] = [
  { label: translate('nav.start'), path: '/', role: 'player' },
  { label: translate('nav.topics'), path: '/topics', role: 'player' },
  { label: translate('nav.gameModes'), path: '/game-modes', role: 'player' },
  { label: translate('nav.userManual'), path: '/user-manual', role: 'player' },
];

const userMenuLinks: NavigationLink[] = [
  {
    label: translate('nav.profile'),
    path: '/profile',
    role: 'player',
    icon: '/buttons/Settings.png',
  },
  {
    label: translate('nav.progress'),
    path: '/progress',
    role: 'player',
    icon: '/badges/badge_1_64x64.png',
  },
];

const adminNavLinks: NavigationLink[] = [
  {
    label: translate('nav.dashboard'),
    path: '/admin/dashboard',
    role: 'admin',
  },
  {
    label: 'Quizze',
    path: '/admin/quizzes',
    role: 'admin',
  },
  {
    label: 'Fragenbank',
    path: '/admin/questions',
    role: 'admin',
  },
  { label: translate('nav.users'), path: '/admin/users', role: 'admin' },
  { label: translate('nav.logs'), path: '/admin/logs', role: 'admin' },
];

export function MainNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isUserMenuOpenRef = useRef(false);
  const {
    user,
    isAuthenticated,
    isAdmin,
    activeRole: _activeRole,
    isViewingAsAdmin,
    logout,
    switchToAdminView,
    switchToPlayerView,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Keep ref in sync with state
  useEffect(() => {
    isUserMenuOpenRef.current = isUserMenuOpen;
  }, [isUserMenuOpen]);

  // Close mobile menu and user menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside (register listener once on mount)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isUserMenuOpenRef.current &&
        !(event.target as Element).closest('.user-menu-container')
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // Empty dependency array - register once on mount

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
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
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="bg-[#061421] border-b border-gray-700"
      >
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
                {translate('nav.login')}
              </Link>
              <Link
                to="/signup"
                className="btn-gradient px-4 py-2 rounded text-sm font-medium transition-all duration-200"
              >
                {translate('nav.register')}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="bg-[#061421] border-b border-gray-700"
    >
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
            {getNavLinks().map(link => (
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
            {/* Wisecoins Display */}
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

            {/* User Dropdown Container */}
            <div className="relative user-menu-container">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <img
                  src={user?.avatar || '/avatars/player_male_with_greataxe.png'}
                  alt={`${user?.username} Avatar`}
                  className="h-8 w-8 rounded-full border-2 border-gray-600"
                />
                <div className="flex items-center space-x-1">
                  <span className="text-white text-sm font-medium">
                    {user?.username}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="py-2">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            user?.avatar ||
                            '/avatars/player_male_with_greataxe.png'
                          }
                          alt={`${user?.username} Avatar`}
                          className="h-10 w-10 rounded-full border-2 border-gray-600"
                        />
                        <div>
                          <p className="text-white font-medium text-sm">
                            {user?.username}
                          </p>
                          <p className="text-gray-400 text-xs">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* User Menu Links */}
                    <div className="py-1">
                      {userMenuLinks.map(link => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={handleLinkClick}
                          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          {link.icon && (
                            <img
                              src={link.icon}
                              alt=""
                              className="h-4 w-4 mr-3 opacity-70 group-hover:opacity-100"
                            />
                          )}
                          <span className="text-sm font-medium">
                            {link.label}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* Admin Role Switcher */}
                    {isAdmin && (
                      <div className="border-t border-gray-700 py-2">
                        <button
                          onClick={
                            isViewingAsAdmin
                              ? handleSwitchToPlayerView
                              : handleSwitchToAdminView
                          }
                          className={`flex items-center w-full px-4 py-3 text-white text-sm font-medium transition-all duration-200 hover:bg-gray-700/50 ${
                            isViewingAsAdmin
                              ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20'
                              : 'bg-gradient-to-r from-green-500/20 to-teal-500/20'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 mr-3 rounded-full ${
                              isViewingAsAdmin
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                                : 'bg-gradient-to-r from-green-500 to-teal-500'
                            }`}
                          />
                          <span>
                            {isViewingAsAdmin
                              ? `${translate('nav.admin')} Modus`
                              : `${translate('nav.player')} Modus`}
                          </span>
                          <svg
                            className="w-4 h-4 ml-auto opacity-70"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Logout Button */}
                    <div className="border-t border-gray-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                      >
                        <img
                          src="/buttons/Logout.png"
                          alt=""
                          className="h-4 w-4 mr-3 opacity-70 group-hover:opacity-100"
                        />
                        <span className="text-sm font-medium">
                          {translate('nav.logout')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-[#FCC822] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-expanded={isMobileMenuOpen}
            aria-label={translate('accessibility.toggleMenu')}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 rounded-b-lg">
              {/* Navigation Links based on active role */}
              {getNavLinks().map(link => (
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
                    src={
                      user?.avatar || '/avatars/player_male_with_greataxe.png'
                    }
                    alt={`${user?.username} Avatar`}
                    className="h-10 w-10 rounded-full border-2 border-gray-600"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="text-base font-medium text-white">
                        {user?.username}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={
                            isViewingAsAdmin
                              ? handleSwitchToPlayerView
                              : handleSwitchToAdminView
                          }
                          className={`flex items-center space-x-1 text-white text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 hover:scale-105 cursor-pointer border ${
                            isViewingAsAdmin
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-purple-400 hover:border-purple-300'
                              : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border-green-400 hover:border-green-300'
                          }`}
                          title={`Aktuell im ${isViewingAsAdmin ? translate('nav.admin') : translate('nav.player')}-Modus. Klicken Sie, um zur ${isViewingAsAdmin ? translate('nav.player') : translate('nav.admin')}-Ansicht zu wechseln.`}
                        >
                          <span>
                            {isViewingAsAdmin
                              ? translate('nav.admin')
                              : translate('nav.player')}
                          </span>
                          <svg
                            className="w-3 h-3 opacity-80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
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

                {/* Mobile User Menu Links */}
                <div className="mt-3 px-2 space-y-1">
                  {userMenuLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleLinkClick}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200"
                    >
                      {link.icon && (
                        <img
                          src={link.icon}
                          alt=""
                          className="h-5 w-5 mr-2 opacity-70"
                        />
                      )}
                      {link.label}
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors duration-200"
                  >
                    <img
                      src="/buttons/Logout.png"
                      alt=""
                      className="h-5 w-5 mr-2"
                    />
                    {translate('nav.logout')}
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
