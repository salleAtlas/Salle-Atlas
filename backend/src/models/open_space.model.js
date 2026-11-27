const mongoose = require('mongoose');
const Space = require('./space.model');

const openSpaceSchema = new mongoose.Schema({
  total_seats: { type: Number, required: true, min: 1, default: 30 },
  price_per_hour_per_seat: { type: Number, required: true, min: 0.01 },
});

module.exports = Space.discriminator('open_space', openSpaceSchema);
