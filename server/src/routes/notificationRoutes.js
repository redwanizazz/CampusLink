const express = require('express');
const router = express.Router();
const nc = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', nc.getNotifications);
router.put('/read-all', nc.markAllRead);
router.put('/:id/read', nc.markRead);
router.delete('/:id', nc.deleteNotification);

module.exports = router;
