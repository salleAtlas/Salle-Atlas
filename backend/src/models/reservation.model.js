const mongoose = require('mongoose');
const { ReservationStatus } = require('./enums');

const reservationSchema = new mongoose.Schema(
  {
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    space_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    reference_code: { type: String, required: true, unique: true },
    space_type: { type: String, enum: ['room', 'open_space'], required: true },
    date: { type: String, required: true, index: true },
    start_time: { type: Date, required: true, index: true },
    end_time: { type: Date, required: true, index: true },
    number_of_people: { type: Number, required: true, min: 1 },
    unit_price_snapshot: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.PENDING,
    },
    pending_expires_at: { type: Date, required: true, index: true },
    qr_token: { type: String, default: null },
    qr_used: { type: Boolean, default: false },
    qr_used_at: { type: Date, default: null },
  },
  { collection: 'reservations', timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
