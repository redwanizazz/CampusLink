const { Notification } = require('../models');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50
    });
    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { id: req.params.id, user_id: req.user.id } }
    );
    res.status(200).json({ message: 'Marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.status(200).json({ message: 'All marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
