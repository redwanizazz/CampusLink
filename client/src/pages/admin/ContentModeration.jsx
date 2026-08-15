import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReports, resolveReport, dismissReport, deleteReportedPost } from '../../api/admin';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import { ShieldAlert, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Dismissed', value: 'dismissed' },
];

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment',
  inappropriate: 'Inappropriate',
  misinformation: 'Misinformation',
  other: 'Other',
};

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  dismissed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const ContentModeration = () => {
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState('');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports', activeStatus],
    queryFn: () => getReports(activeStatus),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
  };

  const resolveMutation = useMutation({
    mutationFn: resolveReport,
    onSuccess: () => { toast.success('Report resolved'); invalidate(); },
    onError: () => toast.error('Failed to resolve'),
  });

  const dismissMutation = useMutation({
    mutationFn: dismissReport,
    onSuccess: () => { toast.success('Report dismissed'); invalidate(); },
    onError: () => toast.error('Failed to dismiss'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReportedPost,
    onSuccess: () => { toast.success('Post deleted and report resolved'); invalidate(); },
    onError: () => toast.error('Failed to delete post'),
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="size-6 text-red-500" /> Content Moderation
        </h1>
        {pendingCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs font-semibold">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveStatus(tab.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Post', 'Reporter', 'Reason', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              [1, 2, 3].map(i => <TableRowSkeleton key={i} cols={6} />)
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No reports found.
                </td>
              </tr>
            ) : (
              reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 align-top">
                  {/* Post preview */}
                  <td className="px-4 py-3 max-w-[220px]">
                    {report.Post ? (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                          {report.Post.content}
                        </p>
                        <p className="text-xs text-gray-400">
                          by {report.Post.Author?.full_name ?? 'Unknown'}
                        </p>
                        <Link
                          to={`/posts/${report.Post.id}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
                        >
                          View <ExternalLink className="size-3" />
                        </Link>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Post deleted</span>
                    )}
                  </td>

                  {/* Reporter */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar user={report.Reporter} size="xs" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {report.Reporter?.full_name}
                      </span>
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs capitalize">
                      {REASON_LABELS[report.reason] ?? report.reason}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[report.status]}`}>
                      {report.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {report.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Mark resolved"
                          onClick={() => resolveMutation.mutate(report.id)}
                          disabled={resolveMutation.isPending}
                          className="text-green-600 hover:text-green-800 disabled:opacity-40"
                        >
                          <CheckCircle className="size-4" />
                        </button>
                        <button
                          type="button"
                          title="Dismiss"
                          onClick={() => dismissMutation.mutate(report.id)}
                          disabled={dismissMutation.isPending}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
                        >
                          <XCircle className="size-4" />
                        </button>
                        {report.Post && (
                          <button
                            type="button"
                            title="Delete post"
                            onClick={() => {
                              toast((t) => (
                                <span className="flex items-center gap-3 text-sm">
                                  Delete this post?
                                  <button
                                    className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium"
                                    onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(report.id); }}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium"
                                    onClick={() => toast.dismiss(t.id)}
                                  >
                                    Cancel
                                  </button>
                                </span>
                              ), { duration: 6000 });
                            }}
                            disabled={deleteMutation.isPending}
                            className="text-red-500 hover:text-red-700 disabled:opacity-40"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
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

export default ContentModeration;
