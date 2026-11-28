const stripe = require('../config/stripe.config');
const env = require('../config/env.config');

// verify stripe webhook signature using raw body
function verifyStripeWebhook(req, res, next) {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    req.stripeEvent = event;
    return next();
  } catch (err) {
    return res.status(400).json({ error: 'Webhook signature verification failed: ' + err.message });
  }
}

module.exports = {
  verifyStripeWebhook,
};
