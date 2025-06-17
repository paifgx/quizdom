import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../contexts/auth';

interface NavLink {
  label: string;
  path: string;
  role?: 'player' | 'admin';
  icon?: string;
}

interface AdminNavLink {
  label: string;
  path: string;
  icon?: string;
}

const playerNavLinks: NavLink[] = [
  { label: 'Start', path: '/', role: 'player' },
  { label: 'Quizübersicht', path: '/quizzes', role: 'player' },
  { label: 'Spielmodi', path: '/game-modes', role: 'player' },
  { label: 'Fortschritt', path: '/progress', role: 'player' },
  { label: 'Profil', path: '/profile', role: 'player' },
];

const adminNavLinks: AdminNavLink[] = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Fragen', path: '/admin/questions' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Logs', path: '/admin/logs' },
];

export function MainNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  // Close admin dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };

    if (isAdminDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAdminDropdownOpen]);

  // Close dropdowns when route changes
  useEffect(() => {
    setIsAdminDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isActiveAdminSection = () => {
    return location.pathname.startsWith('/admin');
  };

  const getActiveAdminPage = () => {
    const activeLink = adminNavLinks.find(link => isActiveLink(link.path));
    return activeLink ? activeLink.label : 'Admin';
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsAdminDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsAdminDropdownOpen(false);
  };

  const toggleAdminDropdown = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
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
                className="btn-gradient px-4 py-2 rounded text-sm font-medium transition-all duration-200"
              >
                Login
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
            {/* Player Navigation Links */}
            {playerNavLinks.map((link) => (
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

            {/* Admin Dropdown */}
            {isAdmin && (
              <div className="relative" ref={adminDropdownRef}>
                <button
                  onClick={toggleAdminDropdown}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActiveAdminSection()
                      ? 'nav-link-active'
                      : 'text-gray-300 hover:text-[#FCC822]'
                  }`}
                  aria-expanded={isAdminDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>{isActiveAdminSection() ? getActiveAdminPage() : 'Admin'}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isAdminDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Admin Dropdown Menu */}
                {isAdminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0A1929] border border-gray-600 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      {adminNavLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                            isActiveLink(link.path)
                              ? 'bg-gray-700 text-[#FCC822]'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-[#FCC822]'
                          }`}
                          onClick={handleLinkClick}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    admin
                  </span>
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
              {/* Player Links */}
              {playerNavLinks.map((link) => (
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

              {/* Admin Section */}
              {isAdmin && (
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Admin
                  </div>
                  {adminNavLinks.map((link) => (
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
                </div>
              )}
              
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
                        <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          admin
                        </span>
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