import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center px-4">
    <p className="text-8xl font-black text-indigo-600 dark:text-indigo-400">404</p>
    <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Page not found</h1>
    <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Back to Dashboard</Link>
  </div>
);

export default NotFound;
