import { create } from 'zustand';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';

let socketInstance = null;

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  unreadCount: 0,

  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    if (socketInstance) return;

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

    socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      set({ socket: socketInstance, isConnected: true });
    });

    socketInstance.on('disconnect', () => {
      set({ isConnected: false });
    });

    socketInstance.on('notification', (payload) => {
      set(state => ({ unreadCount: state.unreadCount + 1 }));
      toast(payload.content, {
        icon: '🔔',
        duration: 4000,
      });
    });

    socketInstance.on('event_update', (payload) => {
      const currentUserId = useAuthStore.getState().user?.id;
      if (payload.organizer_id === currentUserId) return;
      toast(`New event: "${payload.title}"`, {
        icon: '📅',
        duration: 4000,
      });
    });
  },

  clearUnread: () => set({ unreadCount: 0 }),

  disconnect: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      set({ socket: null, isConnected: false, unreadCount: 0 });
    }
  },
}));
