const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const { optionalAuth } = require('../middleware/authMiddleware');

// optionalAuth: validates token when present, passes through for guest users
router.post('/', optionalAuth, queryController.askQuestion);

module.exports = router;
