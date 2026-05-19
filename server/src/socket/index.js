const jwt = require('jsonwebtoken');
const { Chat, ChatMember, Message } = require('../models');

// Memory map of userId -> socketId
const connectedUsers = new Map();

const initSocket = (io) => {
  // Middleware for authenticating socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    
    // Add to connected users map
    connectedUsers.set(userId, socket.id);
    
    // Broadcast user online status
    io.emit('userOnline', userId);

    socket.on('sendMessage', async (data, callback) => {
      try {
        const { receiverId, content, attachmentUrl } = data;
        const senderId = socket.user.id;

        // Ensure 1-on-1 Chat exists
        let chat = await Chat.findOne({
          where: { is_group: false },
          include: [
            { model: ChatMember, where: { user_id: senderId } },
          ]
        });

        // The above query isn't perfect for finding exact 1-on-1. Let's do it manually for reliability in sqlite/mysql:
        // Find all chats where sender is a member
        const senderChats = await ChatMember.findAll({ where: { user_id: senderId } });
        const receiverChats = await ChatMember.findAll({ where: { user_id: receiverId } });
        
        const senderChatIds = senderChats.map(c => c.chat_id);
        const receiverChatIds = receiverChats.map(c => c.chat_id);
        
        let commonChatId = senderChatIds.find(id => receiverChatIds.includes(id));
        
        if (!commonChatId) {
          // Create new chat
          const newChat = await Chat.create({ is_group: false });
          await ChatMember.bulkCreate([
            { chat_id: newChat.id, user_id: senderId, role: 'member' },
            { chat_id: newChat.id, user_id: receiverId, role: 'member' }
          ]);
          commonChatId = newChat.id;
        }

        // Create Message
        const message = await Message.create({
          chat_id: commonChatId,
          sender_id: senderId,
          content,
          attachment_url: attachmentUrl
        });

        // Prepare message payload
        const messagePayload = {
          id: message.id,
          chat_id: commonChatId,
          sender_id: senderId,
          content: message.content,
          created_at: message.created_at,
          attachment_url: message.attachment_url
        };

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(parseInt(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', messagePayload);
        }

        // Return success to sender
        if (callback) callback({ success: true, message: messagePayload });
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

module.exports = {
  initSocket,
  connectedUsers
};
