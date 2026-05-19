const { Chat, ChatMember, Message, User, Department } = require('../models');
const { Op } = require('sequelize');

const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all chat IDs the user is a part of
    const userMemberships = await ChatMember.findAll({
      where: { user_id: userId },
      attributes: ['chat_id']
    });
    
    const chatIds = userMemberships.map(m => m.chat_id);

    // Get chats with other members and latest message
    const chats = await Chat.findAll({
      where: { id: { [Op.in]: chatIds }, is_group: false },
      include: [
        {
          model: ChatMember,
          where: { user_id: { [Op.ne]: userId } },
          include: [
            { model: User, attributes: ['id', 'full_name', 'avatar_url', 'role'], include: [Department] }
          ]
        },
        {
          model: Message,
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    // Format output
    const formattedChats = chats.map(chat => {
      const otherUser = chat.ChatMembers[0]?.User;
      const latestMessage = chat.Messages[0];
      return {
        id: chat.id,
        otherUser,
        latestMessage
      };
    });

    // Sort by latest message descending
    formattedChats.sort((a, b) => {
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.created_at) - new Date(a.latestMessage.created_at);
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Verify user is in this chat
    const isMember = await ChatMember.findOne({
      where: { chat_id: chatId, user_id: userId }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to view these messages' });
    }

    const messages = await Message.findAll({
      where: { chat_id: chatId },
      order: [['created_at', 'ASC']],
      limit,
      offset
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getChatByUserId = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user.id;
    
    const senderChats = await ChatMember.findAll({ where: { user_id: userId } });
    const receiverChats = await ChatMember.findAll({ where: { user_id: targetUserId } });
    
    const senderChatIds = senderChats.map(c => c.chat_id);
    const receiverChatIds = receiverChats.map(c => c.chat_id);
    
    const commonChatId = senderChatIds.find(id => receiverChatIds.includes(id));

    if (!commonChatId) {
       return res.status(200).json(null); // No chat exists yet
    }

    res.status(200).json({ chat_id: commonChatId });
  } catch (error) {
    console.error('Error finding chat by user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getChats,
  getMessages,
  getChatByUserId
};
