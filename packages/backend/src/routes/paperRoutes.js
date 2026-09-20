const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { optionalAuth } = require('../middleware/authMiddleware');

// GET /api/papers — lists all papers belonging to the authenticated user
router.get('/', optionalAuth, uploadController.listUserPapers);

module.exports = router;
