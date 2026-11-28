const Payment = require('../models/payment.model');

// create or update payment for a reservation
async function upsertPaymentForReservation(reservationId, data) {
  return Payment.findOneAndUpdate(
    { reservation_id: reservationId },
    { $set: data },
    { upsert: true, new: true }
  );
}

// find payment by stripe session id
async function findByStripeSessionId(sessionId) {
  return Payment.findOne({ stripe_session_id: sessionId });
}

// find payment by reservation id
async function findByReservationId(reservationId) {
  return Payment.findOne({ reservation_id: reservationId });
}

// update payment status by stripe session id
async function updateByStripeSessionId(sessionId, updates) {
  return Payment.findOneAndUpdate(
    { stripe_session_id: sessionId },
    { $set: updates },
    { new: true }
  );
}

module.exports = {
  upsertPaymentForReservation,
  findByStripeSessionId,
  findByReservationId,
  updateByStripeSessionId,
};
