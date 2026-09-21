const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'success', pong: true, timestamp: Date.now() });
});

router.get('/', healthController.getHealth);

module.exports = router;
