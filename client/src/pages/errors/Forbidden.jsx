import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

const Forbidden = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center px-4">
      <ShieldOff className="size-20 text-red-400 mb-4" />
      <p className="text-6xl font-black text-red-500">403</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
      <p className="mt-2 text-gray-500">You don't have permission to view this page.</p>
      <button type="button" onClick={() => navigate(-1)} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Go Back</button>
    </div>
  );
};

export default Forbidden;
