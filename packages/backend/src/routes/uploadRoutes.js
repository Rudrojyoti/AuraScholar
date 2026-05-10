const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { clerkMiddleware, requireAuth } = require('@clerk/express');

// We don't use multer anymore since Uploadthing handles the upload
// We just receive a JSON body with the fileUrl

router.post('/', clerkMiddleware(), requireAuth(), uploadController.uploadPdf);

module.exports = router;

