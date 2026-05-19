import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, updateUserRole, verifyUser, deleteAdminUser } from '../../api/admin';
import { Skeleton, TableRowSkeleton } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import { Search, CheckCircle, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['student', 'faculty', 'staff', 'admin'];

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [query, setQuery] = useState({ search: '', role: '' });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', query],
    queryFn: () => getAdminUsers(query)
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: () => toast.error('Failed to update role')
  });

  const verifyMutation = useMutation({
    mutationFn: verifyUser,
    onSuccess: () => { toast.success('User verified'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: () => toast.error('Failed to verify')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => { toast.success('User deleted'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: () => toast.error('Failed to delete')
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery({ search, role: roleFilter });
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, or student ID..." className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm">
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Search</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['User', 'Role', 'Verified', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              [1, 2, 3].map(i => <TableRowSkeleton key={i} cols={4} />)
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <Avatar user={u} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{u.full_name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => roleMutation.mutate({ id: u.id, role: e.target.value })}
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 dark:text-white capitalize"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_verified ? (
                      <span className="flex items-center text-green-600 text-xs"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified</span>
                    ) : (
                      <button onClick={() => verifyMutation.mutate(u.id)} className="text-xs text-indigo-600 hover:underline flex items-center">
                        <Shield className="w-3.5 h-3.5 mr-1" /> Verify
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { if (confirm(`Delete ${u.full_name}?`)) deleteMutation.mutate(u.id); }} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
