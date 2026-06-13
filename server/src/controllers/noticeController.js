const { Notice, User, Department } = require('../models');
const { sendUrgentNoticeEmail } = require('../utils/mailer');

const getNotices = async (req, res) => {
  try {
    const { department_id } = req.query;
    const where = {};
    if (department_id) where.department_id = department_id;

    const notices = await Notice.findAll({
      where,
      include: [
        { model: User, as: 'Poster', attributes: ['id', 'full_name', 'role'] },
        { model: Department, attributes: ['id', 'name', 'code'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(notices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getNotice = async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Poster', attributes: ['id', 'full_name', 'role'] },
        { model: Department, attributes: ['id', 'name', 'code'] }
      ]
    });
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    res.status(200).json(notice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createNotice = async (req, res) => {
  try {
    const { title, content, department_id, priority } = req.body;
    const notice = await Notice.create({
      posted_by: req.user.id,
      title,
      content,
      department_id: department_id || null,
      priority: priority || 'normal'
    });
    res.status(201).json(notice);

    if (priority === 'urgent') {
      try {
        const where = { role: 'student' };
        if (department_id) where.department_id = department_id;
        const students = await User.findAll({ where, attributes: ['email'] });
        const noticeUrl = `${process.env.CLIENT_URL}/noticeboard/${notice.id}`;
        await Promise.allSettled(
          students.map(s => sendUrgentNoticeEmail(s.email, title, content, noticeUrl))
        );
      } catch (mailErr) {
        console.error('Urgent notice email error:', mailErr.message);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findOne({ where: { id: req.params.id, posted_by: req.user.id } });
    if (!notice) return res.status(404).json({ error: 'Notice not found or unauthorized' });
    await notice.destroy();
    res.status(200).json({ message: 'Notice deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getNotices, getNotice, createNotice, deleteNotice };
