const Stripe = require('stripe');
const env = require('./env.config');

// create stripe client if key exists
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

module.exports = stripe;
