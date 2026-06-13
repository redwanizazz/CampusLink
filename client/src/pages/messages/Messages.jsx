import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getChats, getMessages, getChatByUserId } from '../../api/chat';
import { getProfile } from '../../api/user';
import { uploadFile } from '../../api/upload';
import { useSocketStore } from '../../store/useSocketStore';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import CreateGroupModal from '../../components/messages/CreateGroupModal';
import { Send, Paperclip, Loader2, Users, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const resolveUrl = (url) => url?.startsWith('http') ? url : `${API_BASE}${url}`;

const isGroup = (chat) => chat?.type === 'group';
const isTempChat = (chat) => chat?.id?.toString().startsWith('temp_');

const Messages = () => {
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('user');

  const { socket, connect } = useSocketStore();
  const { user: currentUser } = useAuthStore();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const typingTimer = useRef(null);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    connect();
    fetchChats();
  }, [connect]);

  useEffect(() => {
    if (initialUserId) initializeDirectChat(initialUserId);
  }, [initialUserId]);

  useEffect(() => {
    if (activeChat?.id && !isTempChat(activeChat)) {
      socket?.emit('join_chat', activeChat.id);
      fetchMessages(activeChat.id);
    }
    return () => {
      if (activeChat?.id) socket?.emit('leave_chat', activeChat.id);
    };
  }, [activeChat?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      if (activeChat && message.chat_id === activeChat.id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      setChats(prev => {
        const idx = prev.findIndex(c => c.id === message.chat_id);
        if (idx >= 0) {
          const updated = [...prev];
          const [chat] = updated.splice(idx, 1);
          return [{ ...chat, latestMessage: message }, ...updated];
        }
        fetchChats();
        return prev;
      });
    };

    const handleTyping = ({ userId: uid }) => {
      if (uid !== currentUser.id) setIsTyping(true);
    };

    const handleStopTyping = () => setIsTyping(false);

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, activeChat, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const fetchChats = async () => {
    try {
      const data = await getChats();
      setChats(data);
    } catch {
      toast.error('Failed to load chats');
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const data = await getMessages(chatId);
      setMessages(data);
      scrollToBottom();
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const initializeDirectChat = async (targetUserId) => {
    try {
      const existing = await getChatByUserId(targetUserId);
      if (existing?.chat_id) {
        const chatObj = chats.find(c => c.id === existing.chat_id);
        if (chatObj) {
          setActiveChat(chatObj);
        } else {
          const profileData = await getProfile(targetUserId);
          setActiveChat({ id: existing.chat_id, type: 'direct', otherUser: profileData.user });
        }
      } else {
        const profileData = await getProfile(targetUserId);
        setActiveChat({ id: `temp_${targetUserId}`, type: 'direct', otherUser: profileData.user });
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupCreated = (group) => {
    setChats(prev => [group, ...prev]);
    setActiveChat(group);
    setMessages([]);
  };

  const handleTypingEmit = () => {
    if (!activeChat || isTempChat(activeChat)) return;
    socket?.emit('typing', { chatId: activeChat.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('stop_typing', { chatId: activeChat.id });
    }, 1500);
  };

  // For groups + existing direct chats use chatId; for new temp_ direct use receiverId.
  const buildSendPayload = (content, attachmentUrl) => {
    if (isGroup(activeChat) || !isTempChat(activeChat)) {
      return { chatId: activeChat.id, content, attachmentUrl };
    }
    return { receiverId: activeChat.otherUser.id, content, attachmentUrl };
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    socket.emit('sendMessage', buildSendPayload(newMessage), (response) => {
      if (response.success) {
        setNewMessage('');
        if (isTempChat(activeChat)) {
          setActiveChat(prev => ({ ...prev, id: response.message.chat_id }));
          fetchChats();
        } else {
          setChats(prev => {
            const idx = prev.findIndex(c => c.id === response.message.chat_id);
            if (idx < 0) return prev;
            const updated = [...prev];
            const [chat] = updated.splice(idx, 1);
            return [{ ...chat, latestMessage: response.message }, ...updated];
          });
        }
      } else {
        toast.error('Failed to send message');
      }
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat || !socket) return;
    e.target.value = '';

    setIsUploading(true);
    try {
      const { url, originalName, mimeType } = await uploadFile(file);
      const fileContent = JSON.stringify({ url, originalName, mimeType });

      socket.emit('sendMessage', buildSendPayload(fileContent, url), (response) => {
        if (!response?.success) {
          toast.error('Failed to send file');
        } else if (isTempChat(activeChat)) {
          setActiveChat(prev => ({ ...prev, id: response.message.chat_id }));
          fetchChats();
        }
      });
    } catch {
      toast.error('Upload failed. Check file type and size (max 10 MB).');
    } finally {
      setIsUploading(false);
    }
  };

  const renderMessageContent = (msg, isMine) => {
    if (msg.type !== 'file') {
      return <p className="text-sm break-words">{msg.content}</p>;
    }
    try {
      const { url, originalName, mimeType } = JSON.parse(msg.content);
      const fileUrl = resolveUrl(url);
      if (mimeType?.startsWith('image/')) {
        return (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <img src={fileUrl} alt={originalName} className="max-w-full rounded-lg max-h-48 object-cover" />
          </a>
        );
      }
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-2 text-sm underline break-all ${isMine ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'}`}>
          <Paperclip className="size-4 flex-shrink-0" />
          <span>{originalName}</span>
        </a>
      );
    } catch {
      const fileUrl = resolveUrl(msg.content);
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-2 text-sm underline ${isMine ? 'text-indigo-100' : 'text-indigo-600'}`}>
          <Paperclip className="size-4" /> Attachment
        </a>
      );
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const previewText = (msg) => {
    if (!msg) return 'New conversation';
    if (msg.type === 'file') return '📎 Attachment';
    return msg.content;
  };

  const groupPreviewPrefix = (msg) =>
    msg?.Sender && msg.sender_id !== currentUser.id ? `${msg.Sender.full_name.split(' ')[0]}: ` : '';

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

      {/* Chat list sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
          <button
            type="button"
            onClick={() => setGroupModalOpen(true)}
            className="flex items-center gap-1 text-xs font-medium bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            title="Create group chat"
          >
            <Plus className="size-3.5" />
            <span>Group</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="p-4 gap-3 flex flex-col">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 gap-2 flex flex-col">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500">No conversations yet.</p>
              <Link
                to="/network"
                className="inline-block text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
              >
                Find people to message
              </Link>
            </div>
          ) : (
            chats.map(chat => {
              const group = isGroup(chat);
              const title = group ? chat.name : chat.otherUser?.full_name;
              return (
                <div
                  key={chat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveChat(chat)}
                  onKeyDown={e => e.key === 'Enter' && setActiveChat(chat)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center gap-3 ${activeChat?.id === chat.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
                >
                  {group ? (
                    <div className="size-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                      <Users className="size-5" />
                    </div>
                  ) : (
                    <Avatar user={chat.otherUser} size="md" className="flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {title}
                        {group && <span className="text-xs text-gray-400 ml-1">· {chat.memberCount}</span>}
                      </h3>
                      {chat.latestMessage && (
                        <span className="text-xs text-gray-400 ml-1 flex-shrink-0">{formatTime(chat.latestMessage.sent_at)}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {group ? groupPreviewPrefix(chat.latestMessage) : ''}
                      {previewText(chat.latestMessage)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-w-0">
        {activeChat ? (
          <>
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm">
              {isGroup(activeChat) ? (
                <div className="size-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                  <Users className="size-5" />
                </div>
              ) : (
                <Avatar user={activeChat.otherUser} size="md" />
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {isGroup(activeChat) ? activeChat.name : activeChat.otherUser?.full_name}
                </h3>
                {isGroup(activeChat) ? (
                  <p className="text-xs text-gray-500">{activeChat.memberCount} members</p>
                ) : isTyping ? (
                  <p className="text-xs text-indigo-500 animate-pulse">typing...</p>
                ) : null}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 gap-3 flex flex-col">
              {messages.map((msg, i) => {
                const isMine = msg.sender_id === currentUser.id;
                const showSenderLabel = isGroup(activeChat) && !isMine;
                return (
                  <div key={msg.id ?? i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {showSenderLabel && (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 px-1">
                        {msg.Sender?.full_name || 'Unknown'}
                      </span>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700'}`}>
                      {renderMessageContent(msg, isMine)}
                      <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {formatTime(msg.sent_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  aria-label="Attach file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  disabled={isUploading || !activeChat}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUploading
                    ? <Loader2 className="size-5 animate-spin" />
                    : <Paperclip className="size-5" />}
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => { setNewMessage(e.target.value); handleTypingEmit(); }}
                  placeholder="Type a message…"
                  aria-label="Message"
                  className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 rounded-full px-4 py-2 text-sm dark:text-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="size-5 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Send className="size-16 text-gray-200 dark:text-gray-700" />
            <p className="text-sm">Select a conversation or start a new one</p>
          </div>
        )}
      </div>

      <CreateGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreated={handleGroupCreated}
      />
    </div>
  );
};

export default Messages;
