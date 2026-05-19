const express = require('express');
const router = express.Router();
const nc = require('../controllers/noticeController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');

router.use(authMiddleware);

router.get('/', nc.getNotices);
router.get('/:id', nc.getNotice);
router.post('/', requireRole('faculty', 'admin'), nc.createNotice);
router.delete('/:id', requireRole('faculty', 'admin'), nc.deleteNotice);

module.exports = router;
