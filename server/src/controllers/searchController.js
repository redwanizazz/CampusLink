const { User, Post, Event, Notice, Department } = require('../models');
const { Op } = require('sequelize');

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }
    const term = `%${q.trim()}%`;

    const [users, posts, events, notices] = await Promise.all([
      User.findAll({
        where: {
          [Op.or]: [
            { full_name: { [Op.like]: term } },
            { student_id: { [Op.like]: term } },
            { email: { [Op.like]: term } }
          ]
        },
        attributes: ['id', 'full_name', 'student_id', 'avatar_url', 'role', 'batch'],
        include: [{ model: Department, attributes: ['name', 'code'] }],
        limit: 10
      }),
      Post.findAll({
        where: { content: { [Op.like]: term }, visibility: 'public' },
        limit: 5
      }),
      Event.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: term } },
            { description: { [Op.like]: term } }
          ]
        },
        limit: 5
      }),
      Notice.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: term } },
            { content: { [Op.like]: term } }
          ]
        },
        limit: 5
      })
    ]);

    res.status(200).json({ users, posts, events, notices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { search };
