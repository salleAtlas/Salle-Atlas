const express = require('express');
const { authClient } = require('../../middlewares/authClient.middleware');
const paymentController = require('../../controllers/api/payment.controller');

const router = express.Router();

// create stripe checkout session
router.post('/checkout-session', authClient, paymentController.createCheckoutSession);

module.exports = router;
