const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', chatController.getChats);
router.post('/', chatController.createOrGetDirectChat);
router.get('/user/:targetUserId', chatController.getChatByUserId);
router.get('/:chatId/messages', chatController.getMessages);

module.exports = router;
