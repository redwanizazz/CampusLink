const express = require('express');
const router = express.Router();
const { getDepartments } = require('../controllers/departmentController');

// Public — needed on register page before auth
router.get('/', getDepartments);

module.exports = router;
