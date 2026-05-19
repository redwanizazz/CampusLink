import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, Sun, Moon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocketStore } from '../../store/useSocketStore';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { logoutApi } from '../../api/auth';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { unreadCount, clearUnread } = useSocketStore();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : document.documentElement.classList.contains('dark');
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // clear client state regardless of server response
    }
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        onClick={toggleSidebar}
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <Link to="/search" className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-0 h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-400 bg-transparent text-sm">
            Search users, posts, events...
          </span>
        </Link>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button onClick={() => setIsDark(!isDark)} className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link
            to="/notifications"
            onClick={clearUnread}
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 relative"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" aria-hidden="true" />

          <div className="relative">
            <button className="-m-1.5 flex items-center p-1.5" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span className="sr-only">Open user menu</span>
              <Avatar user={user} size="sm" />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                  {user?.full_name || 'User'}
                </span>
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-36 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5">
                <Link
                  to={`/profile/${user?.id}`}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-3 py-1.5 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  My Profile
                </Link>
                <Link
                  to="/profile/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-3 py-1.5 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-1.5 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
