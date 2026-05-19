import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getChats, getMessages, getChatByUserId } from '../../api/chat';
import { getProfile } from '../../api/user';
import { useSocketStore } from '../../store/useSocketStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Send, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

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
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    connect();
    fetchChats();
  }, [connect]);

  useEffect(() => {
    if (initialUserId) {
      initializeDirectChat(initialUserId);
    }
  }, [initialUserId]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      // If the message belongs to the current open chat, append it
      if (activeChat && message.chat_id === activeChat.id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }

      // Re-order and update the chats list on the left sidebar
      setChats((prevChats) => {
        let existingChatIndex = prevChats.findIndex(c => c.id === message.chat_id);
        let updatedChats = [...prevChats];

        if (existingChatIndex >= 0) {
          const chatToUpdate = { ...updatedChats[existingChatIndex], latestMessage: message };
          updatedChats.splice(existingChatIndex, 1);
          updatedChats.unshift(chatToUpdate);
        } else {
          // It's a new chat, we might want to refetch chats entirely 
          // or construct a temporary object. For simplicity, refetch.
          fetchChats();
        }
        return updatedChats;
      });
    };

    socket.on('receiveMessage', handleReceiveMessage);
    return () => socket.off('receiveMessage', handleReceiveMessage);
  }, [socket, activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchChats = async () => {
    try {
      const data = await getChats();
      setChats(data);
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const initializeDirectChat = async (targetUserId) => {
    try {
      const existingChat = await getChatByUserId(targetUserId);
      if (existingChat && existingChat.chat_id) {
        // Find it in our list and set active
        const chatObj = chats.find(c => c.id === existingChat.chat_id);
        if (chatObj) setActiveChat(chatObj);
        else {
          // We need to fetch the target user profile to create a mock chat obj
          const profileData = await getProfile(targetUserId);
          setActiveChat({ id: existingChat.chat_id, otherUser: profileData.user });
        }
      } else {
        // It's a brand new chat that doesn't exist yet in the DB
        const profileData = await getProfile(targetUserId);
        setActiveChat({ id: 'temp_' + targetUserId, otherUser: profileData.user });
        setMessages([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    const payload = {
      receiverId: activeChat.otherUser.id,
      content: newMessage,
    };

    socket.emit('sendMessage', payload, (response) => {
      if (response.success) {
        setMessages((prev) => [...prev, response.message]);
        setNewMessage('');
        scrollToBottom();
        
        // If it was a temp chat, refetch chats to get the real DB ID
        if (activeChat.id.toString().startsWith('temp_')) {
          setActiveChat(prev => ({ ...prev, id: response.message.chat_id }));
          fetchChats();
        } else {
          // Update local chat list latest message
          setChats(prev => {
            let updated = [...prev];
            const idx = updated.findIndex(c => c.id === response.message.chat_id);
            if (idx >= 0) {
               updated[idx].latestMessage = response.message;
               const [moved] = updated.splice(idx, 1);
               updated.unshift(moved);
            }
            return updated;
          });
        }
      } else {
        toast.error('Failed to send message');
      }
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No conversations yet. Discover people in the Network tab to start chatting!</div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center ${activeChat?.id === chat.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
              >
                <img 
                  src={chat.otherUser?.avatar_url ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${chat.otherUser.avatar_url}` : 'https://via.placeholder.com/40'} 
                  alt="" 
                  className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                />
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{chat.otherUser?.full_name}</h3>
                    {chat.latestMessage && (
                      <span className="text-xs text-gray-500">
                        {new Date(chat.latestMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.latestMessage ? chat.latestMessage.content : 'New conversation'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center shadow-sm z-10">
              <img 
                src={activeChat.otherUser?.avatar_url ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${activeChat.otherUser.avatar_url}` : 'https://via.placeholder.com/40'} 
                alt="" 
                className="w-10 h-10 rounded-full bg-gray-200 object-cover"
              />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{activeChat.otherUser?.full_name}</h3>
                <p className="text-xs text-gray-500 capitalize">{activeChat.otherUser?.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isMine = msg.sender_id === currentUser.id;
                return (
                  <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                      isMine 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700'
                    }`}>
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 rounded-full px-4 py-2 text-sm dark:text-white"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
            <Send className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
