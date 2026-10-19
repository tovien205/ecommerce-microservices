const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('./auth.controller');
const { authenticateToken } = require('./auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getProfile);

module.exports = router;