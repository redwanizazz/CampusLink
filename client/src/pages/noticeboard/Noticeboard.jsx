import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotices } from '../../api/notice';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { Bell, AlertTriangle, Info, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';

const priorityIcon = {
  urgent: <AlertTriangle className="w-4 h-4 text-red-500" />,
  important: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  normal: <Info className="w-4 h-4 text-blue-400" />
};

const priorityBadge = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  important: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  normal: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
};

const Noticeboard = () => {
  const { user } = useAuthStore();
  const { data: notices = [], isLoading } = useQuery({ queryKey: ['notices'], queryFn: getNotices });
  const canPost = user?.role === 'faculty' || user?.role === 'admin';

  const sorted = notices.toSorted((a, b) => {
    const order = { urgent: 0, important: 1, normal: 2 };
    return order[a.priority] - order[b.priority] || new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Bell className="size-6 mr-2 text-indigo-500" /> Noticeboard
        </h1>
        {canPost && (
          <Link to="/noticeboard/create" className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="size-4" /> <span>Post Notice</span>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bell className="size-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No notices yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(n => (
            <Link key={n.id} to={`/noticeboard/${n.id}`} className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5">{priorityIcon[n.priority]}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{n.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{n.Poster?.full_name}</span>
                      {n.Department && <span className="text-indigo-500">{n.Department.name}</span>}
                      <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${priorityBadge[n.priority]}`}>
                  {n.priority}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Noticeboard;
