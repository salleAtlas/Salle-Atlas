const { CreateCheckoutSessionDto } = require('../../dtos/payment.dto');
const stripeService = require('../../services/stripe.service');

// create checkout session for a pending reservation
async function createCheckoutSession(req, res, next) {
  try {
    const dto = new CreateCheckoutSessionDto(req.body);
    const result = await stripeService.createCheckoutSession(req.user.id, dto.reservation_id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

// handle verified stripe webhook
async function handleWebhook(req, res, next) {
  try {
    await stripeService.handleWebhookEvent(req.stripeEvent);
    return res.status(200).json({ received: true });
  } catch (err) {
    return next(err);
  }
}

// get reservation status for frontend payment-success check
async function getReservationStatus(req, res, next) {
  try {
    const reservation = await stripeService.getReservationStatus(req.user.id, req.params.id);
    return res.status(200).json({ reservation });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getReservationStatus,
};
