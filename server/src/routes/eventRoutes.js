const express = require('express');
const router = express.Router();
const ec = require('../controllers/eventController');

const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');

router.use(authMiddleware);

router.get('/', ec.getEvents);
router.get('/my-events', ec.getMyEvents);
router.get('/:id', ec.getEvent);
router.post('/:id/rsvp', ec.rsvpEvent);
router.get('/:id/export-rsvp', ec.exportAttendees);

router.post('/', requireRole('faculty', 'admin'), ec.createEvent);
router.put('/:id', requireRole('faculty', 'admin'), ec.updateEvent);
router.delete('/:id', requireRole('faculty', 'admin'), ec.deleteEvent);

module.exports = router;
