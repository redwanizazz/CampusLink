const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe } = require('../controllers/pushController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.post('/subscribe', subscribe);
router.delete('/subscribe', unsubscribe);

module.exports = router;
