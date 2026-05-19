const { Chat, ChatMember, Message, User, Department } = require('../models');
const { Op } = require('sequelize');

const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await ChatMember.findAll({
      where: { user_id: userId },
      attributes: ['chat_id']
    });
    const chatIds = memberships.map(m => m.chat_id);

    if (chatIds.length === 0) return res.status(200).json([]);

    const chats = await Chat.findAll({
      where: { id: { [Op.in]: chatIds }, type: 'direct' },
      include: [
        {
          model: ChatMember,
          where: { user_id: { [Op.ne]: userId } },
          include: [{ model: User, attributes: ['id', 'full_name', 'avatar_url', 'role'], include: [Department] }]
        },
        {
          model: Message,
          limit: 1,
          order: [['sent_at', 'DESC']]
        }
      ]
    });

    const formatted = chats.map(chat => ({
      id: chat.id,
      type: chat.type,
      otherUser: chat.ChatMembers[0]?.User,
      latestMessage: chat.Messages[0] || null
    }));

    formatted.sort((a, b) => {
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.sent_at) - new Date(a.latestMessage.sent_at);
    });

    res.status(200).json(formatted);
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

    const isMember = await ChatMember.findOne({ where: { chat_id: chatId, user_id: userId } });
    if (!isMember) return res.status(403).json({ error: 'Not authorized to view these messages' });

    const messages = await Message.findAll({
      where: { chat_id: chatId },
      order: [['sent_at', 'ASC']],
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

    if (!commonChatId) return res.status(200).json(null);
    res.status(200).json({ chat_id: commonChatId });
  } catch (error) {
    console.error('Error finding chat by user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createOrGetDirectChat = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user.id;

    if (parseInt(targetUserId) === userId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    const senderChats = await ChatMember.findAll({ where: { user_id: userId } });
    const receiverChats = await ChatMember.findAll({ where: { user_id: targetUserId } });
    const senderIds = senderChats.map(c => c.chat_id);
    const receiverIds = receiverChats.map(c => c.chat_id);
    const commonId = senderIds.find(id => receiverIds.includes(id));

    if (commonId) return res.status(200).json({ chat_id: commonId });

    const chat = await Chat.create({ type: 'direct', created_by: userId });
    await ChatMember.bulkCreate([
      { chat_id: chat.id, user_id: userId },
      { chat_id: chat.id, user_id: targetUserId }
    ]);

    res.status(201).json({ chat_id: chat.id });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getChats, getMessages, getChatByUserId, createOrGetDirectChat };
