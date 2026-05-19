import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../../api/user';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { MapPin, Mail, Phone, Book } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileView = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile(id);
        setProfile(data);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile || !profile.user) return <div>User not found</div>;

  const { user, recentPosts } = profile;
  const isOwnProfile = currentUser?.id === parseInt(id);

  return (
    <div className="space-y-6">
      {/* Cover and Avatar Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20 relative z-10">
          <img 
            src={user.avatar_url ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${user.avatar_url}` : 'https://via.placeholder.com/150'} 
            alt="Avatar" 
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
          />
          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name}</h1>
            <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role} • {user.Department?.name}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            {isOwnProfile ? (
              <Button onClick={() => window.location.href='/profile/edit'}>Edit Profile</Button>
            ) : (
              <Button>Connect</Button>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">About</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              {user.bio || "No bio provided yet."}
            </p>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Book className="w-4 h-4 mr-3 text-indigo-500" />
                <span>Batch {user.batch || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-indigo-500" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-indigo-500" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
            {recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map(post => (
                  <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
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
