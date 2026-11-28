const stripe = require('../config/stripe.config');
const env = require('../config/env.config');
const { ReservationStatus, PaymentStatus } = require('../models/enums');
const paymentRepo = require('../repositories/payment.repository');
const reservationRepo = require('../repositories/reservation.repository');
const { toCheckoutResponse, toReservationStatusResponse } = require('../mappers/payment.mapper');

function createError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// create stripe checkout session for a pending reservation
async function createCheckoutSession(clientId, reservationId) {
  if (!stripe) {
    throw createError('Stripe is not configured', 500);
  }
  if (!reservationId) {
    throw createError('reservation_id is required', 400);
  }

  const reservation = await reservationRepo.findById(reservationId);
  if (!reservation) {
    throw createError('Reservation not found', 404);
  }

  // check that this client owns the reservation
  if (reservation.client_id.toString() !== String(clientId)) {
    throw createError('You are not allowed to pay for this reservation', 403);
  }

  if (reservation.status !== ReservationStatus.PENDING) {
    throw createError('Reservation is not pending payment', 400);
  }

  // if 10 min window already passed, expire it now
  if (new Date(reservation.pending_expires_at) <= new Date()) {
    await reservationRepo.expireReservation(reservation._id);
    throw createError('Reservation payment window has expired', 400);
  }

  const resId = reservation._id.toString();
  const unitAmount = Math.round(reservation.total_amount * 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Salle Atlas - ' + reservation.reference_code,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      reservation_id: resId,
      reference_code: reservation.reference_code,
    },
    success_url: env.CLIENT_ORIGIN + '/payment-success?reservation_id=' + resId + '&session_id={CHECKOUT_SESSION_ID}',
    cancel_url: env.CLIENT_ORIGIN + '/payment-failed?reservation_id=' + resId,
  });

  const payment = await paymentRepo.upsertPaymentForReservation(reservation._id, {
    reservation_id: reservation._id,
    stripe_session_id: session.id,
    amount: reservation.total_amount,
    status: PaymentStatus.PENDING,
    payment_date: null,
  });

  return toCheckoutResponse(session, payment);
}

// handle verified stripe webhook events
async function handleWebhookEvent(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reservationId = session.metadata ? session.metadata.reservation_id : null;

    await paymentRepo.updateByStripeSessionId(session.id, {
      status: PaymentStatus.SUCCESSFUL,
      payment_date: new Date(),
    });

    if (reservationId) {
      await reservationRepo.confirmReservation(reservationId);
    }
    return;
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const reservationId = session.metadata ? session.metadata.reservation_id : null;

    await paymentRepo.updateByStripeSessionId(session.id, {
      status: PaymentStatus.FAILED,
    });

    if (reservationId) {
      await reservationRepo.expireReservation(reservationId);
    }
    return;
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    await paymentRepo.updateByStripeSessionId(session.id, {
      status: PaymentStatus.FAILED,
    });
  }
}

// get reservation status for client verification
async function getReservationStatus(clientId, reservationId) {
  const reservation = await reservationRepo.findById(reservationId);
  if (!reservation) {
    throw createError('Reservation not found', 404);
  }

  if (reservation.client_id.toString() !== String(clientId)) {
    throw createError('You are not allowed to view this reservation', 403);
  }

  return toReservationStatusResponse(reservation);
}

module.exports = {
  createCheckoutSession,
  handleWebhookEvent,
  getReservationStatus,
};
