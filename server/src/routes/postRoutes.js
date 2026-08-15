const express = require('express');
const router = express.Router();
const pc = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/feed', pc.getFeed);
router.post('/', pc.createPost);
router.get('/:id', pc.getPost);
router.delete('/:id', pc.deletePost);
router.post('/:id/like', pc.toggleLike);
router.post('/:id/comments', pc.addComment);
router.post('/:id/report', pc.reportPost);

module.exports = router;
