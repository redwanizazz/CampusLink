import React, { useState, useEffect } from 'react';
import { getConnections } from '../../api/connection';
import UserCard from '../../components/features/UserCard';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await getConnections();
      setConnections(data);
    } catch (error) {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (userId) => {
    // Navigates to a message creation or direct chat
    navigate(`/messages?user=${userId}`);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Connections</h1>
        <div className="space-x-4">
          <Link to="/network" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300">Discover</Link>
          <Link to="/network/requests" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300">Requests</Link>
        </div>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          You don't have any connections yet. <Link to="/network" className="text-indigo-600">Discover people</Link>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {connections.map((conn) => (
            <UserCard 
              key={conn.connection_id} 
              user={conn.user} 
              actionType="message"
              onAction={handleMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Connections;
