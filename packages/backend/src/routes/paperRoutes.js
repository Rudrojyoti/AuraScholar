const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { optionalAuth } = require('../middleware/authMiddleware');

// GET /api/papers/stats — returns total papers and chunks ingested for telemetry
router.get('/stats', optionalAuth, uploadController.getUserStats);

// GET /api/papers — lists all papers belonging to the authenticated user
router.get('/', optionalAuth, uploadController.listUserPapers);

module.exports = router;
