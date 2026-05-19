import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed, createPost, toggleLike, addComment } from '../api/post';
import { getEvents } from '../api/event';
import { getNotices } from '../api/notice';
import { useAuthStore } from '../store/useAuthStore';
import Avatar from '../components/ui/Avatar';
import { PostSkeleton, Skeleton } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Calendar, Bell, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, currentUserId }) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const liked = post.PostLikes?.some(l => l.user_id === currentUserId);

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] })
  });

  const commentMutation = useMutation({
    mutationFn: () => addComment(post.id, commentText),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => toast.error('Failed to post comment')
  });

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <div className="flex items-center space-x-3">
        <Link to={`/profile/${post.Author?.id}`}>
          <Avatar user={post.Author} size="md" />
        </Link>
        <div>
          <Link to={`/profile/${post.Author?.id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600">
            {post.Author?.full_name}
          </Link>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>

      <div className="flex items-center space-x-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => likeMutation.mutate()}
          className={`flex items-center space-x-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{post.PostLikes?.length || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.PostComments?.length || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="space-y-3 pt-2">
          {post.PostComments?.map(c => (
            <div key={c.id} className="flex items-start space-x-2">
              <Avatar user={c.User} size="xs" className="mt-0.5" />
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-white">{c.User?.full_name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={e => { e.preventDefault(); if (commentText.trim()) commentMutation.mutate(); }} className="flex items-center space-x-2">
            <Avatar user={{ full_name: '' }} size="xs" />
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 border-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
            />
            <button type="submit" disabled={!commentText.trim()} className="text-indigo-600 disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState('');

  const { data: feed = [], isLoading: feedLoading } = useQuery({ queryKey: ['feed'], queryFn: getFeed });
  const { data: events = [] } = useQuery({ queryKey: ['events', { upcoming: true }], queryFn: () => getEvents({ upcoming: true }) });
  const { data: notices = [] } = useQuery({ queryKey: ['notices'], queryFn: getNotices });

  const createPostMutation = useMutation({
    mutationFn: () => createPost({ content: postContent }),
    onSuccess: () => {
      setPostContent('');
      toast.success('Post created!');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => toast.error('Failed to create post')
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Feed */}
        <div className="lg:col-span-2 space-y-5">
          {/* Create post */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start space-x-3">
              <Avatar user={user} size="md" />
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-gray-400"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => { if (postContent.trim()) createPostMutation.mutate(); }}
                    disabled={!postContent.trim() || createPostMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {createPostMutation.isPending ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {feedLoading ? (
            <>{[1, 2, 3].map(i => <PostSkeleton key={i} />)}</>
          ) : feed.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Your feed is empty</p>
              <p className="text-gray-400 text-sm mt-1">Connect with people to see their posts here.</p>
              <Link to="/network" className="mt-4 inline-block text-indigo-600 text-sm font-medium hover:underline">Discover people</Link>
            </div>
          ) : (
            feed.map(post => <PostCard key={post.id} post={post} currentUserId={user?.id} />)
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Upcoming events */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Upcoming Events
              </h3>
              <Link to="/events" className="text-xs text-indigo-600 hover:underline">See all</Link>
            </div>
            {events.slice(0, 3).length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map(ev => (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -mx-2 transition-colors">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ev.title}</p>
                    <p className="text-xs text-gray-400">{new Date(ev.start_time).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent notices */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Bell className="w-4 h-4 mr-2 text-indigo-500" /> Recent Notices
              </h3>
              <Link to="/noticeboard" className="text-xs text-indigo-600 hover:underline">See all</Link>
            </div>
            {notices.slice(0, 3).length === 0 ? (
              <p className="text-sm text-gray-400">No notices yet.</p>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 3).map(n => (
                  <Link key={n.id} to={`/noticeboard/${n.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -mx-2 transition-colors">
                    <div className="flex items-center space-x-2">
                      {n.priority === 'urgent' && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                      {n.priority === 'important' && <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />}
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
