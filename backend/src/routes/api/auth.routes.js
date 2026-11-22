const express = require('express');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const { validateRegister, validateLogin } = require('../../middlewares/validators/auth.validator');
const { authClient } = require('../../middlewares/authClient.middleware');
const { register, login, getMe } = require('../../controllers/api/auth.controller');

const router = express.Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', authClient, getMe);

module.exports = router;
