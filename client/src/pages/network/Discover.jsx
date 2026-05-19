import React, { useState, useEffect } from 'react';
import { discoverUsers, sendRequest } from '../../api/connection';
import UserCard from '../../components/features/UserCard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await discoverUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      setProcessingId(userId);
      await sendRequest(userId);
      toast.success('Connection request sent!');
      setUsers(users.filter(u => u.id !== userId)); // Remove from discover list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discover People</h1>
        <div className="space-x-4">
          <Link to="/network/connections" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300">My Connections</Link>
          <Link to="/network/requests" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300">Requests</Link>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No new people to discover right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              actionType="connect"
              onAction={handleConnect}
              isProcessing={processingId === user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Discover;
