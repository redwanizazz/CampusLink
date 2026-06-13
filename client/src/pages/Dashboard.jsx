import React, { useState, useRef } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed, createPost, toggleLike, addComment, reportPost } from '../api/post';
import { getEvents } from '../api/event';
import { getNotices } from '../api/notice';
import { uploadFile } from '../api/upload';
import { useAuthStore } from '../store/useAuthStore';
import Avatar from '../components/ui/Avatar';
import { PostSkeleton, Skeleton } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Calendar, Bell, BookOpen, Flag, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const POST_MAX = 500;
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
];

const PostCard = ({ post, currentUserId }) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  const liked = post.PostLikes?.some(l => l.user_id === currentUserId);
  const isOwnPost = post.Author?.id === currentUserId;

  const reportMutation = useMutation({
    mutationFn: (reason) => reportPost(post.id, reason),
    onSuccess: () => {
      toast.success('Post reported. Thank you for keeping CampusLink safe.');
      setShowReportMenu(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.error ?? 'Failed to report post';
      toast.error(msg);
      setShowReportMenu(false);
    },
  });

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
      <div className="flex items-center gap-3">
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

      {post.image_url && (
        <img
          src={`${API_BASE}${post.image_url}`}
          alt="Post attachment"
          className="rounded-xl w-full max-h-96 object-cover border border-gray-100 dark:border-gray-700"
        />
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
          <Heart className={`size-4 ${liked ? 'fill-current' : ''}`} />
          <span>{post.PostLikes?.length || 0}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <MessageCircle className="size-4" />
          <span>{post.PostComments?.length || 0}</span>
        </button>

        {!isOwnPost && (
          <div className="relative ml-auto">
            <button
              type="button"
              title="Report post"
              onClick={() => setShowReportMenu(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <Flag className="size-3.5" />
            </button>
            {showReportMenu && (
              <div className="absolute right-0 bottom-7 z-20 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Report reason</p>
                {REPORT_REASONS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => reportMutation.mutate(r.value)}
                    disabled={reportMutation.isPending}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowReportMenu(false)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 mt-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
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
          <form onSubmit={e => { e.preventDefault(); if (commentText.trim()) commentMutation.mutate(); }} className="flex items-center gap-2">
            <Avatar user={{ full_name: '' }} size="xs" />
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              aria-label="Comment"
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 border-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
            />
            <button type="submit" disabled={!commentText.trim()} className="text-indigo-600 disabled:opacity-40">
              <Send className="size-4" />
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
  const [postImage, setPostImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef(null);

  const {
    data: feedData,
    isLoading: feedLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  const feed = feedData?.pages.flatMap(p => p.posts) ?? [];
  const { data: events = [] } = useQuery({ queryKey: ['events', { upcoming: true }], queryFn: () => getEvents({ upcoming: true }) });
  const { data: notices = [] } = useQuery({ queryKey: ['notices'], queryFn: getNotices });

  const createPostMutation = useMutation({
    mutationFn: () => createPost({ content: postContent, image_url: postImage }),
    onSuccess: () => {
      setPostContent('');
      setPostImage(null);
      toast.success('Post created!');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => toast.error('Failed to create post')
  });

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Only image files are allowed');
    if (file.size > 10 * 1024 * 1024) return toast.error('Image must be under 10 MB');
    setImageUploading(true);
    try {
      const { url } = await uploadFile(file);
      setPostImage(url);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Feed */}
        <div className="lg:col-span-2 space-y-5">
          {/* Create post */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <Avatar user={user} size="md" />
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value.slice(0, POST_MAX))}
                  placeholder="What's on your mind?"
                  aria-label="Post content"
                  rows={3}
                  maxLength={POST_MAX}
                  className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-gray-400"
                />
                <p className={`text-xs text-right mt-1 ${postContent.length >= POST_MAX ? 'text-red-500' : 'text-gray-400'}`}>
                  {postContent.length}/{POST_MAX}
                </p>

                {postImage && (
                  <div className="relative mt-2 inline-block">
                    <img src={`${API_BASE}${postImage}`} alt="Preview" className="h-32 rounded-xl object-cover border border-gray-200 dark:border-gray-600" />
                    <button type="button" onClick={() => setPostImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div>
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={imageUploading}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 disabled:opacity-50 transition-colors"
                    >
                      <ImagePlus className="size-4" />
                      <span>{imageUploading ? 'Uploading…' : 'Photo'}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { if (postContent.trim()) createPostMutation.mutate(); }}
                    disabled={!postContent.trim() || createPostMutation.isPending || imageUploading}
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
            <>
              {feed.map(post => <PostCard key={post.id} post={post} currentUserId={user?.id} />)}
              {hasNextPage && (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full py-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors"
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more posts'}
                </button>
              )}
            </>
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
              <div className="text-center py-4">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-600" />
                <p className="text-sm text-gray-400">No upcoming events.</p>
                <Link to="/events" className="text-xs text-indigo-500 hover:underline mt-1 inline-block">Browse events</Link>
              </div>
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
              <div className="text-center py-4">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-600" />
                <p className="text-sm text-gray-400">No notices yet.</p>
              </div>
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
