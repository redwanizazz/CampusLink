const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/discover', connectionController.discoverUsers);
router.post('/request', connectionController.sendRequest);
router.put('/request/:connectionId/accept', connectionController.acceptRequest);
router.delete('/request/:connectionId/reject', connectionController.rejectRequest);
router.delete('/:connectionId', connectionController.removeConnection);
router.get('/', connectionController.getConnections);
router.get('/pending', connectionController.getPendingRequests);

module.exports = router;
