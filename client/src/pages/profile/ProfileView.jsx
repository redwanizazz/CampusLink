import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '../../api/user';
import { sendRequest } from '../../api/connection';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { PostSkeleton } from '../../components/ui/Skeleton';
import { Mail, Phone, Book, MessageSquare, UserPlus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id)
  });

  const connectMutation = useMutation({
    mutationFn: () => sendRequest(parseInt(id)),
    onSuccess: () => {
      toast.success('Connection request sent!');
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send request')
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700" />
          <div className="px-6 py-4 flex items-end -mt-16">
            <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white" />
          </div>
        </div>
        <div className="space-y-4">
          <PostSkeleton /><PostSkeleton />
        </div>
      </div>
    );
  }

  if (!profile?.user) return <div className="p-8 text-gray-500">User not found.</div>;

  const { user, recentPosts, connectionStatus } = profile;
  const isOwnProfile = currentUser?.id === parseInt(id);

  const renderConnectionButton = () => {
    if (isOwnProfile) {
      return <Button onClick={() => navigate('/profile/edit')}>Edit Profile</Button>;
    }
    if (connectionStatus === 'accepted') return null;
    if (connectionStatus === 'pending') {
      return (
        <Button variant="secondary" disabled className="flex items-center">
          <Clock className="w-4 h-4 mr-2" /> Pending
        </Button>
      );
    }
    return (
      <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending} className="flex items-center">
        <UserPlus className="w-4 h-4 mr-2" />
        {connectMutation.isPending ? 'Sending...' : 'Connect'}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20 relative z-10">
          <Avatar user={user} size="2xl" className="border-4 border-white dark:border-gray-800" />
          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name}</h1>
            <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role} • {user.Department?.name}</p>
            {user.batch && <p className="text-sm text-gray-400">Batch {user.batch}</p>}
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            {!isOwnProfile && connectionStatus === 'accepted' && (
              <Button variant="secondary" onClick={() => navigate(`/messages?user=${id}`)} className="flex items-center w-auto px-4">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
            )}
            {renderConnectionButton()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">About</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">{user.bio || 'No bio provided yet.'}</p>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Book className="size-4 mr-3 text-indigo-500 flex-shrink-0" />
                <span>Batch {user.batch || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Mail className="size-4 mr-3 text-indigo-500 flex-shrink-0" />
                <span className="break-all">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="size-4 mr-3 text-indigo-500 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
            {recentPosts?.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map(post => (
                  <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <p className="text-gray-800 dark:text-gray-200 text-sm">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
