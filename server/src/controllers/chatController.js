const { Chat, ChatMember, Message, User, Department } = require('../models');
const { Op, fn, col } = require('sequelize');

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
      where: { id: { [Op.in]: chatIds } },
      include: [
        {
          model: ChatMember,
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'avatar_url', 'role'],
            include: [Department]
          }]
        },
        {
          model: Message,
          limit: 1,
          order: [['sent_at', 'DESC']]
        }
      ]
    });

    // Count unread messages per chat (messages from others that haven't been read yet)
    const unreadRows = await Message.findAll({
      where: {
        chat_id: { [Op.in]: chatIds },
        sender_id: { [Op.ne]: userId },
        read_at: null,
      },
      attributes: ['chat_id', [fn('COUNT', col('id')), 'count']],
      group: ['chat_id'],
      raw: true,
    });
    const unreadMap = new Map(unreadRows.map(r => [r.chat_id, parseInt(r.count)]));

    const formatted = chats.map(chat => {
      const members = chat.ChatMembers || [];
      const unreadCount = unreadMap.get(chat.id) || 0;
      if (chat.type === 'direct') {
        const other = members.find(m => m.user_id !== userId);
        return {
          id: chat.id,
          type: 'direct',
          otherUser: other?.User,
          latestMessage: chat.Messages[0] || null,
          unreadCount,
        };
      }
      return {
        id: chat.id,
        type: 'group',
        name: chat.name,
        created_by: chat.created_by,
        members: members.map(m => m.User).filter(Boolean),
        memberCount: members.length,
        latestMessage: chat.Messages[0] || null,
        unreadCount,
      };
    });

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
      include: [{ model: User, as: 'Sender', attributes: ['id', 'full_name', 'avatar_url'] }],
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
    const commonIds = senderChatIds.filter(id => receiverChatIds.includes(id));

    if (commonIds.length === 0) return res.status(200).json(null);

    const direct = await Chat.findOne({
      where: { id: { [Op.in]: commonIds }, type: 'direct' }
    });
    if (!direct) return res.status(200).json(null);
    res.status(200).json({ chat_id: direct.id });
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
    const commonIds = senderIds.filter(id => receiverIds.includes(id));

    if (commonIds.length > 0) {
      const existing = await Chat.findOne({
        where: { id: { [Op.in]: commonIds }, type: 'direct' }
      });
      if (existing) return res.status(200).json({ chat_id: existing.id });
    }

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

const createGroupChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, memberIds } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Group name too long (max 100 chars)' });
    }
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'memberIds must be a non-empty array' });
    }

    // Normalise, dedupe, exclude self
    const cleanIds = [...new Set(memberIds.map(id => parseInt(id)).filter(id => !isNaN(id) && id !== userId))];
    if (cleanIds.length === 0) {
      return res.status(400).json({ error: 'At least one other member required' });
    }

    // Validate all member ids exist
    const users = await User.findAll({ where: { id: { [Op.in]: cleanIds } }, attributes: ['id'] });
    if (users.length !== cleanIds.length) {
      return res.status(400).json({ error: 'One or more member ids are invalid' });
    }

    const chat = await Chat.create({
      type: 'group',
      name: name.trim(),
      created_by: userId
    });

    await ChatMember.bulkCreate([
      { chat_id: chat.id, user_id: userId },
      ...cleanIds.map(id => ({ chat_id: chat.id, user_id: id }))
    ]);

    const members = await ChatMember.findAll({
      where: { chat_id: chat.id },
      include: [{ model: User, attributes: ['id', 'full_name', 'avatar_url', 'role'] }]
    });

    res.status(201).json({
      id: chat.id,
      type: 'group',
      name: chat.name,
      created_by: userId,
      members: members.map(m => m.User),
      memberCount: members.length,
      latestMessage: null
    });
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const isMember = await ChatMember.findOne({ where: { chat_id: chatId, user_id: userId } });
    if (!isMember) return res.status(403).json({ error: 'Not authorized' });

    const chat = await Chat.findByPk(chatId, {
      include: [{
        model: ChatMember,
        include: [{ model: User, attributes: ['id', 'full_name', 'avatar_url', 'role'] }]
      }]
    });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    res.status(200).json({
      id: chat.id,
      type: chat.type,
      name: chat.name,
      created_by: chat.created_by,
      members: (chat.ChatMembers || []).map(m => m.User).filter(Boolean)
    });
  } catch (error) {
    console.error('Error getting chat details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const isMember = await ChatMember.findOne({ where: { chat_id: chatId, user_id: userId } });
    if (!isMember) return res.status(403).json({ error: 'Not authorized' });

    await Message.update(
      { read_at: new Date() },
      { where: { chat_id: chatId, sender_id: { [Op.ne]: userId }, read_at: null } }
    );

    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getChats,
  getMessages,
  getChatByUserId,
  createOrGetDirectChat,
  createGroupChat,
  getChatDetails,
  markChatAsRead,
};
