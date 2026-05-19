const { Post, PostLike, PostComment, User, Department, Connection, Notification } = require('../models');
const { Op } = require('sequelize');
const { emitNotification } = require('../socket/index');

const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    // Gather IDs of accepted connections
    const connections = await Connection.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ requester_id: userId }, { addressee_id: userId }]
      }
    });
    const connectedIds = connections.map(c =>
      c.requester_id === userId ? c.addressee_id : c.requester_id
    );
    connectedIds.push(userId);

    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { visibility: 'public' },
          { author_id: { [Op.in]: connectedIds }, visibility: 'connections' },
          { author_id: userId }
        ]
      },
      include: [
        { model: User, as: 'Author', attributes: ['id', 'full_name', 'avatar_url', 'role'], include: [Department] },
        { model: PostLike, attributes: ['id', 'user_id'] },
        {
          model: PostComment,
          include: [{ model: User, attributes: ['id', 'full_name', 'avatar_url'] }],
          order: [['created_at', 'ASC']],
          limit: 3
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { content, visibility } = req.body;
    const post = await Post.create({
      author_id: req.user.id,
      content,
      visibility: visibility || 'public'
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Author', attributes: ['id', 'full_name', 'avatar_url', 'role'] },
        { model: PostLike, attributes: ['id', 'user_id'] },
        {
          model: PostComment,
          include: [{ model: User, attributes: ['id', 'full_name', 'avatar_url'] }],
          order: [['created_at', 'ASC']]
        }
      ]
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, author_id: req.user.id } });
    if (!post) return res.status(404).json({ error: 'Post not found or unauthorized' });
    await post.destroy();
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const existing = await PostLike.findOne({
      where: { post_id: req.params.id, user_id: req.user.id }
    });
    if (existing) {
      await existing.destroy();
      return res.status(200).json({ liked: false });
    }
    await PostLike.create({ post_id: req.params.id, user_id: req.user.id, liked_at: new Date() });
    res.status(201).json({ liked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findByPk(req.params.id, { attributes: ['id', 'author_id'] });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await PostComment.create({
      post_id: req.params.id,
      user_id: req.user.id,
      content
    });
    const withUser = await PostComment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'full_name', 'avatar_url'] }]
    });
    res.status(201).json(withUser);

    if (post.author_id !== req.user.id) {
      try {
        const notif = await Notification.create({
          user_id: post.author_id,
          type: 'comment',
          content: `${withUser.User.full_name} commented on your post`,
          link_url: `/posts/${post.id}`,
        });
        emitNotification(post.author_id, notif.toJSON());
      } catch (e) {
        console.error('Notification error (addComment):', e.message);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getFeed, createPost, getPost, deletePost, toggleLike, addComment };
