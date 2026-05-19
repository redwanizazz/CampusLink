import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { updateProfile, uploadAvatar } from '../../api/user';
import { getMe } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

const ProfileEdit = () => {
  const { user, setAuth, token } = useAuthStore();
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  // Sync state if user changes
  useEffect(() => {
    setBio(user?.bio || '');
    setPhone(user?.phone || '');
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      setIsLoading(true);
      await uploadAvatar(formData);
      
      // Refresh user data globally
      const updatedUser = await getMe();
      setAuth(updatedUser.user, token);
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await updateProfile({ bio, phone });
      
      const updatedUser = await getMe();
      setAuth(updatedUser.user, token);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h1>
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar user={user} size="2xl" className="border-4 border-gray-200 dark:border-gray-700 group-hover:opacity-75 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">Click to change avatar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              rows={4}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm bg-white dark:bg-gray-800 dark:text-white"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-auto">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
