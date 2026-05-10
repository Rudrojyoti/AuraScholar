const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const { clerkMiddleware, requireAuth } = require('@clerk/express');

router.post('/', clerkMiddleware(), requireAuth(), queryController.askQuestion);

module.exports = router;

