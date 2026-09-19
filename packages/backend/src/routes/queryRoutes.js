const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const config = require('../config');
const { clerkMiddleware } = require('@clerk/express');

// Optional Clerk middleware
const optionalAuth = (req, res, next) => {
  if (config.clerk && config.clerk.secretKey) {
    try {
      return clerkMiddleware()(req, res, () => {
        next();
      });
    } catch (e) {
      return next();
    }
  }
  next();
};

router.post('/', optionalAuth, queryController.askQuestion);

module.exports = router;
