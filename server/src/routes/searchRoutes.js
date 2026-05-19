const express = require('express');
const router = express.Router();
const { search } = require('../controllers/searchController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', search);

module.exports = router;
