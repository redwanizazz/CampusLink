const { User, Post, Event, Connection, Message, sequelize } = require('../models');

const getStats = async (req, res) => {
  try {
    const [users, posts, events, messages, connections] = await Promise.all([
      User.count(),
      Post.count(),
      Event.count(),
      Message.count(),
      Connection.count({ where: { status: 'accepted' } })
    ]);
    res.status(200).json({ users, posts, events, messages, connections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { student_id: { [Op.like]: `%${search}%` } }
      ];
    }
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['student', 'faculty', 'staff', 'admin'];
    if (!allowed.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ role });
    res.status(200).json({ message: 'Role updated', user: { id: user.id, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update({ is_verified: true });
    res.status(200).json({ message: 'User verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getStats, getUsers, updateUserRole, verifyUser, deleteUser };
