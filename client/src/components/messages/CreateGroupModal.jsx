import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConnections } from '../../api/connection';
import { createGroupChat } from '../../api/chat';
import Avatar from '../ui/Avatar';
import { X, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ open, onClose, onCreated }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(new Set());

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: createGroupChat,
    onSuccess: (group) => {
      toast.success(`Group "${group.name}" created`);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      onCreated?.(group);
      resetAndClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to create group');
    }
  });

  const resetAndClose = () => {
    setName('');
    setSelected(new Set());
    onClose();
  };

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Group name is required');
    if (selected.size === 0) return toast.error('Select at least one member');
    createMutation.mutate({ name: name.trim(), memberIds: [...selected] });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetAndClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> New Group Chat
          </h3>
          <button type="button" onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g. CSE 2024 Project"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Add members ({selected.size} selected)
            </label>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading connections...</div>
              ) : connections.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No connections yet. Add people from the Network tab first.
                </div>
              ) : (
                connections.map(({ user }) => (
                  <label key={user.id} className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={selected.has(user.id)}
                      onChange={() => toggle(user.id)}
                      className="h-4 w-4 text-indigo-600 rounded"
                    />
                    <Avatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={resetAndClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
