import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPost, toggleLike, addComment } from '../../api/post';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Heart, Send, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: post, isLoading } = useQuery({ queryKey: ['post', id], queryFn: () => getPost(id) });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['post', id] })
  });

  const commentMutation = useMutation({
    mutationFn: () => addComment(id, commentText),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
    onError: () => toast.error('Failed to post comment')
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl max-w-2xl mx-auto" />;
  if (!post) return <div className="text-center py-16 text-gray-500">Post not found.</div>;

  const liked = post.PostLikes?.some(l => l.user_id === user?.id);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.Author?.id}`}><Avatar user={post.Author} size="md" /></Link>
          <div>
            <Link to={`/profile/${post.Author?.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 text-sm">{post.Author?.full_name}</Link>
            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
          </div>
        </div>

        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">{post.content}</p>

        <div className="flex items-center space-x-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => likeMutation.mutate()} className={`flex items-center space-x-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{post.PostLikes?.length || 0} likes</span>
          </button>
        </div>

        {/* Comments */}
        <div className="space-y-4 pt-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Comments ({post.PostComments?.length || 0})</h3>

          {post.PostComments?.map(c => (
            <div key={c.id} className="flex items-start space-x-3">
              <Avatar user={c.User} size="sm" className="mt-0.5" />
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2 flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-white">{c.User?.full_name}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={e => { e.preventDefault(); if (commentText.trim()) commentMutation.mutate(); }} className="flex items-center space-x-3">
            <Avatar user={user} size="sm" />
            <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-transparent px-4 py-2 text-sm dark:text-white outline-none" />
              <button type="submit" disabled={!commentText.trim()} className="px-3 py-2 text-indigo-600 disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;
