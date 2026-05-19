import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';

let socketInstance = null;

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (socketInstance) return; // Already connected

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
  },

  disconnect: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      set({ socket: null, isConnected: false });
    }
  }
}));
