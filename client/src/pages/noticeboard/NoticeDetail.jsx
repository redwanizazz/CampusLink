import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getNotice } from '../../api/notice';
import { Skeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, AlertTriangle, Info, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const priorityIcon = {
  urgent: <AlertTriangle className="w-5 h-5 text-red-500" />,
  important: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  normal: <Info className="w-5 h-5 text-blue-400" />
};

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: notice, isLoading } = useQuery({ queryKey: ['notice', id], queryFn: () => getNotice(id) });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );

  if (!notice) return <div className="text-center py-16 text-gray-500">Notice not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="size-4 mr-1" /> Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-5">
        <div className="flex items-start gap-3">
          {priorityIcon[notice.priority]}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{notice.title}</h1>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          <span>Posted by <strong className="text-gray-800 dark:text-gray-200">{notice.Poster?.full_name}</strong></span>
          {notice.Department && <span className="text-indigo-600">· {notice.Department.name}</span>}
          <span>· {format(new Date(notice.created_at), 'PPP')}</span>
        </div>

        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {notice.content}
        </div>

        {notice.attachment_url && (
          <a href={`${API_BASE}${notice.attachment_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
            <Paperclip className="size-4" />
            <span>View Attachment</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default NoticeDetail;
