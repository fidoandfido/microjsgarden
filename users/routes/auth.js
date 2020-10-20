const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/signup', authController.createAccount);
router.post('/refresh', authController.refreshToken);

module.exports = router;
