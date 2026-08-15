import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation }  from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { ClipboardList, BarChart2, TrendingUp, Clock, BookOpen, Award } from 'lucide-react';

const tabs = [
  { label: 'Overview', path: '/academics', icon: BookOpen, exact: true },
  { label: 'Attendance', path: '/academics/attendance', icon: ClipboardList },
  { label: 'Marks', path: '/academics/marks', icon: BarChart2 },
  { label: 'Results', path: '/academics/results', icon: Award },
  { label: 'CGPA', path: '/academics/cgpa', icon: TrendingUp },
  { label: 'Routine', path: '/academics/routine', icon: Clock },
];

const Academics = () => {
  const { pathname } = useLocation();
  const isOverview = pathname === '/academics';
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {tabs.map(({ label, path, icon: Icon, exact }) => {
          const active = exact ? pathname === path : pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {isOverview ? (
        !mounted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {tabs.slice(1).map(({ path }) => (
              <Skeleton key={path} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {tabs.slice(1).map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
              </Link>
            ))}
          </div>
        )
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Academics;
