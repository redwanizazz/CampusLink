import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markRead, markAllRead, deleteNotification } from '../../api/notification';
import { Skeleton } from '../../components/ui/Skeleton';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Notifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useQuery({ queryKey: ['notifications'], queryFn: getNotifications });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markOneMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const handleRowClick = (n) => {
    if (!n.is_read) markOneMutation.mutate(n.id);
    if (n.link) navigate(n.link);
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Bell className="w-6 h-6 mr-2 text-indigo-500" /> Notifications
          {unread > 0 && <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">{unread}</span>}
        </h1>
        {unread > 0 && (
          <button type="button" onClick={() => markAllMutation.mutate()} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            <CheckCheck className="w-4 h-4" /> <span>Mark all read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>All caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleRowClick(n)}
              className={`flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 border transition-colors ${n.link ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600' : ''} ${n.is_read ? 'border-gray-200 dark:border-gray-700' : 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10'}`}
            >
              {!n.is_read && <div className="size-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'}`}>{n.content}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); markOneMutation.mutate(n.id); }}
                    className="p-1 text-indigo-400 hover:text-indigo-600"
                  >
                    <CheckCheck className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
