import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/Button';
import Avatar from '../ui/Avatar';

const UserCard = ({ user, actionType, onAction, onSecondaryAction, isProcessing }) => {
  const renderAction = () => {
    switch (actionType) {
      case 'connect':
        return (
          <Button onClick={() => onAction(user.id)} disabled={isProcessing} className="w-full">
            <UserPlus className="w-4 h-4 mr-2" /> Connect
          </Button>
        );
      case 'accept':
        return (
          <div className="flex space-x-2">
            <Button onClick={() => onAction()} disabled={isProcessing} className="flex-1 bg-green-600 hover:bg-green-700">
              <UserCheck className="w-4 h-4 mr-2" /> Accept
            </Button>
            <Button onClick={() => onSecondaryAction()} disabled={isProcessing} variant="secondary" className="px-3">
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        );
      case 'cancel':
        return (
          <Button onClick={() => onAction()} disabled={isProcessing} variant="secondary" className="w-full text-red-600 hover:bg-red-50">
            Cancel Request
          </Button>
        );
      case 'message':
        return (
          <Button onClick={() => onAction(user.id)} disabled={isProcessing} className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" /> Message
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex flex-col items-center text-center">
        <Link to={`/profile/${user.id}`}>
          <Avatar user={user} size="xl" className="mb-3 border-2 border-gray-100 dark:border-gray-700" />
        </Link>
        <Link to={`/profile/${user.id}`}>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
            {user.full_name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-1">{user.role}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 line-clamp-1">
          {user.Department?.name || 'Unknown Department'}
        </p>
        <div className="w-full mt-auto">
          {renderAction()}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
