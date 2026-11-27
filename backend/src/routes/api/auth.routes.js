const express = require('express');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const { validateRegister } = require('../../middlewares/validators/auth.validator');
const { register } = require('../../controllers/api/auth.controller');

const router = express.Router();

router.post('/register', authLimiter, validateRegister, register);

module.exports = router;
