const express = require('express');
const authRoutes = require('./auth.routes');
const paymentRoutes = require('./payment.routes');
const { authClient } = require('../../middlewares/authClient.middleware');
const paymentController = require('../../controllers/api/payment.controller');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/payments', paymentRoutes);

// verify reservation status after payment redirect
router.get('/reservations/:id', authClient, paymentController.getReservationStatus);

module.exports = router;
