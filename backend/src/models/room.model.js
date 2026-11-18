const mongoose = require('mongoose');
const Space = require('./space.model');

const roomSchema = new mongoose.Schema({
  capacity: { type: Number, required: true, min: 1, index: true },
  price_per_hour: { type: Number, required: true, min: 0.01, index: true },
  photos: { type: [String], default: [] },
  equipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
});

module.exports = Space.discriminator('room', roomSchema);
