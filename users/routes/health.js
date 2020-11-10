const express = require('express');

const router = express.Router();
const healthController = require('../controllers/health.js');

router.get('/alive', healthController.alive);
router.get('/ready', healthController.ready);

module.exports = router;
