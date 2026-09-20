const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { optionalAuth } = require('../middleware/authMiddleware');

// optionalAuth: validates token when present, passes through for guest users
router.post('/', optionalAuth, uploadController.uploadPdf);

module.exports = router;
