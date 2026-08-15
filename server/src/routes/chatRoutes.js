const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', chatController.getChats);
router.post('/', chatController.createOrGetDirectChat);
router.post('/group', chatController.createGroupChat);
router.get('/user/:targetUserId', chatController.getChatByUserId);
router.get('/:chatId/details', chatController.getChatDetails);
router.get('/:chatId/messages', chatController.getMessages);
router.post('/:chatId/read', chatController.markChatAsRead);

module.exports = router;
