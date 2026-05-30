const jwt = require('jsonwebtoken');
const { Chat, ChatMember, Message } = require('../models');

// userId -> socketId
const connectedUsers = new Map();

let _io = null;

const emitNotification = (userId, payload) => {
  if (_io) _io.to(`user:${userId}`).emit('notification', payload);
};

const broadcastEventUpdate = (payload) => {
  if (_io) _io.emit('event_update', payload);
};

const initSocket = (io) => {
  _io = io;
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Token missing'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit('userOnline', userId);

    // ─── join/leave chat rooms ───────────────────────────────────────────────
    socket.on('join_chat', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // ─── typing indicators ───────────────────────────────────────────────────
    socket.on('typing', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing', { chatId, userId });
    });

    socket.on('stop_typing', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('stop_typing', { chatId, userId });
    });

    // ─── message_read ────────────────────────────────────────────────────────
    socket.on('message_read', async ({ messageId, chatId }) => {
      try {
        const readAt = new Date();
        await Message.update({ read_at: readAt }, { where: { id: messageId, read_at: null } });
        socket.to(`chat:${chatId}`).emit('message_read', { messageId, readAt });
      } catch (err) {
        console.error('message_read error:', err);
      }
    });

    // ─── send message ────────────────────────────────────────────────────────
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { receiverId, content, attachmentUrl } = data;
        const senderId = socket.user.id;

        // Find existing 1-on-1 chat between sender and receiver
        const senderChats = await ChatMember.findAll({ where: { user_id: senderId } });
        const receiverChats = await ChatMember.findAll({ where: { user_id: receiverId } });

        const senderChatIds = senderChats.map(c => c.chat_id);
        const receiverChatIds = receiverChats.map(c => c.chat_id);
        let commonChatId = senderChatIds.find(id => receiverChatIds.includes(id));

        if (!commonChatId) {
          const newChat = await Chat.create({ type: 'direct', created_by: senderId });
          await ChatMember.bulkCreate([
            { chat_id: newChat.id, user_id: senderId },
            { chat_id: newChat.id, user_id: receiverId }
          ]);
          commonChatId = newChat.id;
        }

        const message = await Message.create({
          chat_id: commonChatId,
          sender_id: senderId,
          content,
          type: attachmentUrl ? 'file' : 'text',
        });

        const payload = {
          id: message.id,
          chat_id: commonChatId,
          sender_id: senderId,
          content: message.content,
          type: message.type,
          sent_at: message.sent_at,
          read_at: null,
        };

        // Broadcast to everyone in the chat room (sender included if they joined)
        io.to(`chat:${commonChatId}`).emit('receiveMessage', payload);

        // Direct-emit to receiver only if they haven't joined the room
        const receiverSocketId = connectedUsers.get(parseInt(receiverId));
        if (receiverSocketId) {
          const room = io.sockets.adapter.rooms.get(`chat:${commonChatId}`);
          if (!room || !room.has(receiverSocketId)) {
            io.to(receiverSocketId).emit('receiveMessage', payload);
          }
        }

        if (callback) callback({ success: true, message: payload });
      } catch (error) {
        console.error('Socket sendMessage error:', error);
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      io.emit('userOffline', userId);
    });
  });
};

module.exports = { initSocket, emitNotification, broadcastEventUpdate, connectedUsers };
