import React, { useState, useEffect } from 'react';
import { getPendingRequests, acceptRequest, rejectRequest } from '../../api/connection';
import UserCard from '../../components/features/UserCard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Requests = () => {
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      setProcessingId(connectionId);
      await acceptRequest(connectionId);
      toast.success('Request accepted');
      setRequests(prev => ({
        ...prev,
        incoming: prev.incoming.filter(r => r.id !== connectionId)
      }));
    } catch (error) {
      toast.error('Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      setProcessingId(connectionId);
      await rejectRequest(connectionId);
      toast.success('Request removed');
      setRequests(prev => ({
        incoming: prev.incoming.filter(r => r.id !== connectionId),
        outgoing: prev.outgoing.filter(r => r.id !== connectionId)
      }));
    } catch (error) {
      toast.error('Failed to process request');
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

  const currentList = activeTab === 'incoming' ? requests.incoming : requests.outgoing;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connection Requests</h1>
        <div className="space-x-4">
          <Link to="/network" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300">Discover</Link>
          <Link to="/network/connections" className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300">My Connections</Link>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'incoming' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          Received ({requests.incoming.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'outgoing' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          Sent ({requests.outgoing.length})
        </button>
      </div>

      {currentList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {activeTab} requests right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentList.map((req) => (
            <UserCard 
              key={req.id} 
              user={activeTab === 'incoming' ? req.Requester : req.Addressee} 
              actionType={activeTab === 'incoming' ? 'accept' : 'cancel'}
              onAction={activeTab === 'incoming' ? () => handleAccept(req.id) : () => handleReject(req.id)}
              onSecondaryAction={activeTab === 'incoming' ? () => handleReject(req.id) : null}
              isProcessing={processingId === req.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
