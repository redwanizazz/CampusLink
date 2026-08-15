import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, MessageSquare, GraduationCap, Calendar, Bell, Search, Shield, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocketStore } from '../../store/useSocketStore';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuthStore();
  const { unreadCount: unreadMessageCount, clearUnread: clearUnreadMessages } = useSocketStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Network', path: '/network', icon: Users },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Academics', path: '/academics', icon: GraduationCap },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Noticeboard', path: '/noticeboard', icon: Bell },
    { name: 'Search', path: '/search', icon: Search },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  const close = () => { if (window.innerWidth < 1024) setIsOpen(false); };

  const handleNavClick = (item) => {
    if (item.name === 'Messages') clearUnreadMessages();
    close();
  };

  return (
    <>
      {isOpen && (
        <div role="presentation" className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">CampusLink</span>
          <button type="button" onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-0.5 px-2">
            {navItems.map(item => {
              const showBadge = item.name === 'Messages' && unreadMessageCount > 0;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => handleNavClick(item)}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`
                  }
                >
                  <item.icon className="mr-3 flex-shrink-0 size-5" />
                  <span className="flex-1">{item.name}</span>
                  {showBadge && (
                    <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
