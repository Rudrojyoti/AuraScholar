const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const config = require('../config');
const { clerkMiddleware } = require('@clerk/express');

// Optional Clerk middleware (only enforced if CLERK_SECRET_KEY is configured)
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

router.post('/', optionalAuth, uploadController.uploadPdf);

module.exports = router;
