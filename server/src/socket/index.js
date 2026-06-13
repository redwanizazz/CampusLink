const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Chat, ChatMember, Message, User } = require('../models');
const { sendPushToUser } = require('../controllers/pushController');

// userId -> socketId
const connectedUsers = new Map();

let _io = null;

const emitNotification = (userId, payload) => {
  if (_io) _io.to(`user:${userId}`).emit('notification', payload);
  sendPushToUser(userId, { title: 'CampusLink', body: payload.content, url: payload.link_url });
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
    // data: { chatId?, receiverId?, content, attachmentUrl? }
    //   - chatId  → existing chat (group OR direct). Verifies membership.
    //   - receiverId → direct-chat path. Finds or creates a 1-on-1 chat.
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { chatId, receiverId, content, attachmentUrl } = data;
        const senderId = socket.user.id;
        let targetChatId = chatId ? parseInt(chatId) : null;
        const isDirectByReceiver = !targetChatId;

        if (isDirectByReceiver) {
          if (!receiverId) {
            if (callback) callback({ success: false, error: 'chatId or receiverId required' });
            return;
          }
          // Find existing 1-on-1 chat (restricted to type='direct' — group chats
          // sharing both users must not be matched).
          const senderRows = await ChatMember.findAll({ where: { user_id: senderId }, attributes: ['chat_id'] });
          const receiverRows = await ChatMember.findAll({ where: { user_id: receiverId }, attributes: ['chat_id'] });
          const senderIds = senderRows.map(r => r.chat_id);
          const receiverIds = receiverRows.map(r => r.chat_id);
          const candidateIds = senderIds.filter(id => receiverIds.includes(id));

          if (candidateIds.length > 0) {
            const direct = await Chat.findOne({
              where: { id: { [Op.in]: candidateIds }, type: 'direct' }
            });
            if (direct) targetChatId = direct.id;
          }

          if (!targetChatId) {
            const newChat = await Chat.create({ type: 'direct', created_by: senderId });
            await ChatMember.bulkCreate([
              { chat_id: newChat.id, user_id: senderId },
              { chat_id: newChat.id, user_id: receiverId }
            ]);
            targetChatId = newChat.id;
          }
        } else {
          // Existing chat (group or direct) — verify membership
          const isMember = await ChatMember.findOne({
            where: { chat_id: targetChatId, user_id: senderId }
          });
          if (!isMember) {
            if (callback) callback({ success: false, error: 'Not a member of this chat' });
            return;
          }
        }

        const message = await Message.create({
          chat_id: targetChatId,
          sender_id: senderId,
          content,
          type: attachmentUrl ? 'file' : 'text',
        });

        const sender = await User.findByPk(senderId, {
          attributes: ['id', 'full_name', 'avatar_url']
        });

        const payload = {
          id: message.id,
          chat_id: targetChatId,
          sender_id: senderId,
          Sender: sender,
          content: message.content,
          type: message.type,
          sent_at: message.sent_at,
          read_at: null,
        };

        io.to(`chat:${targetChatId}`).emit('receiveMessage', payload);

        // Direct-emit fallback to any member NOT currently in the chat room
        // (so their chat list updates even when the chat is closed).
        const room = io.sockets.adapter.rooms.get(`chat:${targetChatId}`);
        const memberRows = await ChatMember.findAll({
          where: { chat_id: targetChatId },
          attributes: ['user_id']
        });
        for (const m of memberRows) {
          if (m.user_id === senderId) continue;
          const sockId = connectedUsers.get(m.user_id);
          if (sockId && (!room || !room.has(sockId))) {
            io.to(sockId).emit('receiveMessage', payload);
          }
        }

        if (callback) callback({ success: true, message: payload });
      } catch (error) {
        console.error('Socket sendMessage error:', error);
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    socket.on('mark_group_read', async ({ chatId, messageId }) => {
      try {
        const sender = await User.findByPk(userId, { attributes: ['id', 'full_name'] });
        socket.to(`chat:${chatId}`).emit('group_seen', {
          chatId,
          messageId,
          userId,
          userName: sender?.full_name ?? 'Someone',
        });
      } catch (err) {
        console.error('mark_group_read error:', err);
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      io.emit('userOffline', userId);
    });
  });
};

module.exports = { initSocket, emitNotification, broadcastEventUpdate, connectedUsers };
