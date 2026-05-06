const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

router.post('/', queryController.askQuestion);

module.exports = router;
