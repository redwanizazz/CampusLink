const { Op } = require('sequelize');
const { User, Post, Event, EventRSVP, Department, Connection, Message, Report, sequelize } = require('../models');

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

const getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dateKey = (d) => {
      const date = new Date(d);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const buildDateMap = () => {
      const map = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        map[dateKey(d)] = 0;
      }
      return map;
    };

    const [recentUsers, recentPosts, allEvents, allDepts] = await Promise.all([
      User.findAll({ where: { created_at: { [Op.gte]: thirtyDaysAgo } }, attributes: ['created_at'] }),
      Post.findAll({ where: { created_at: { [Op.gte]: thirtyDaysAgo } }, attributes: ['created_at'] }),
      Event.findAll({ attributes: ['id', 'title'], order: [['created_at', 'DESC']], limit: 20 }),
      Department.findAll({ attributes: ['id', 'name', 'code'] })
    ]);

    const userMap = buildDateMap();
    recentUsers.forEach(u => { const k = dateKey(u.created_at); if (k in userMap) userMap[k]++; });

    const postMap = buildDateMap();
    recentPosts.forEach(p => { const k = dateKey(p.created_at); if (k in postMap) postMap[k]++; });

    const eventStats = await Promise.all(
      allEvents.map(async e => ({
        name: e.title.length > 22 ? e.title.slice(0, 22) + '…' : e.title,
        rsvps: await EventRSVP.count({ where: { event_id: e.id } })
      }))
    );
    const topEvents = eventStats.sort((a, b) => b.rsvps - a.rsvps).slice(0, 5);

    const departmentBreakdown = await Promise.all(
      allDepts.map(async d => ({
        name: d.code,
        fullName: d.name,
        count: await User.count({ where: { department_id: d.id } })
      }))
    );

    res.status(200).json({
      userRegistrations: Object.entries(userMap).map(([date, count]) => ({ date, count })),
      postActivity: Object.entries(postMap).map(([date, count]) => ({ date, count })),
      topEvents,
      departmentBreakdown
    });
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

const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const reports = await Report.findAll({
      where,
      include: [
        { model: User, as: 'Reporter', attributes: ['id', 'full_name', 'avatar_url'] },
        {
          model: Post,
          required: false,
          attributes: ['id', 'content', 'author_id'],
          include: [{ model: User, as: 'Author', attributes: ['id', 'full_name'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resolveReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    await report.update({ status: 'resolved', resolved_by: req.user.id });
    res.status(200).json({ message: 'Report resolved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const dismissReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    await report.update({ status: 'dismissed', resolved_by: req.user.id });
    res.status(200).json({ message: 'Report dismissed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteReportedPost = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const post = await Post.findByPk(report.post_id);
    if (!post) {
      await report.update({ status: 'resolved', resolved_by: req.user.id });
      return res.status(200).json({ message: 'Post already deleted; report resolved' });
    }

    await post.destroy();
    await report.update({ status: 'resolved', resolved_by: req.user.id });
    res.status(200).json({ message: 'Post deleted and report resolved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getStats,
  getAnalytics,
  getUsers,
  updateUserRole,
  verifyUser,
  deleteUser,
  getReports,
  resolveReport,
  dismissReport,
  deleteReportedPost
};
