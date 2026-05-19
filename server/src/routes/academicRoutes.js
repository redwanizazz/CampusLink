const express = require('express');
const router = express.Router();
const ac = require('../controllers/academicController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');

router.use(authMiddleware);

router.get('/courses', ac.getEnrolledCourses);
router.get('/attendance', ac.getAttendance);
router.get('/marks', ac.getMarks);
router.get('/cgpa', ac.getCgpa);
router.get('/routine', ac.getRoutine);

// Faculty / Admin only
router.post('/attendance', requireRole('faculty', 'admin'), ac.markAttendance);
router.post('/marks', requireRole('faculty', 'admin'), ac.recordMark);

module.exports = router;
