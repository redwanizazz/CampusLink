const express = require('express');
const router = express.Router();
const ac = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');

router.use(authMiddleware, requireRole('admin'));

router.get('/stats', ac.getStats);
router.get('/users', ac.getUsers);
router.put('/users/:id/role', ac.updateUserRole);
router.put('/users/:id/verify', ac.verifyUser);
router.delete('/users/:id', ac.deleteUser);

module.exports = router;
