const { User, Department, Post, Connection } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Department, attributes: ['name', 'code'] }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Optionally fetch connection status if the viewer is different
    let connectionStatus = null;
    if (req.user.id !== parseInt(userId)) {
      const conn = await Connection.findOne({
        where: {
          [Op.or]: [
            { requester_id: req.user.id, addressee_id: userId },
            { requester_id: userId, addressee_id: req.user.id }
          ]
        }
      });
      if (conn) connectionStatus = conn.status;
    }

    // Fetch recent posts
    const recentPosts = await Post.findAll({
      where: { author_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.status(200).json({ user, connectionStatus, recentPosts });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, phone } = req.body;
    const userId = req.user.id;

    await User.update({ bio, phone }, { where: { id: userId } });

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file' });
    }

    const userId = req.user.id;
    // req.file.filename contains the generated filename
    const avatarUrl = `/uploads/${req.file.filename}`;

    await User.update({ avatar_url: avatarUrl }, { where: { id: userId } });

    res.status(200).json({ message: 'Avatar updated successfully', avatar_url: avatarUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password_hash = newPasswordHash;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword
};
