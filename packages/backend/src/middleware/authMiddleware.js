const { clerkMiddleware, getAuth } = require('@clerk/express');

/**
 * Initialises Clerk on every request — attaches req.auth
 * Must be used before requireAuth.
 */
const clerkInit = clerkMiddleware();

/**
 * Requires a signed-in user. Returns 401 if the token is missing or invalid.
 * Reads req.auth populated by clerkInit.
 */
const requireAuth = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized — please sign in to continue.'
    });
  }
  next();
};

/**
 * Soft auth — attaches req.auth if a valid token is present,
 * but lets unauthenticated requests through (guest mode fallback).
 */
const optionalAuth = (req, res, next) => {
  clerkInit(req, res, next);
};

module.exports = { clerkInit, requireAuth, optionalAuth };
