import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStats } from '../../api/admin';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { Users, FileText, Calendar, MessageSquare, UserCheck, Settings } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
    <div className={`size-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="size-5 text-white" />
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '–'}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </div>
);

const Admin = () => {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: getStats });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Settings className="w-6 h-6 mr-2 text-indigo-500" /> Admin Dashboard
        </h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Users" value={stats?.users} color="bg-indigo-500" />
          <StatCard icon={UserCheck} label="Connections" value={stats?.connections} color="bg-green-500" />
          <StatCard icon={FileText} label="Posts" value={stats?.posts} color="bg-purple-500" />
          <StatCard icon={Calendar} label="Events" value={stats?.events} color="bg-orange-500" />
          <StatCard icon={MessageSquare} label="Messages" value={stats?.messages} color="bg-blue-500" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/users" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="size-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
            <Users className="size-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
            <p className="text-sm text-gray-500">Search, verify, and manage user roles</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Admin;
