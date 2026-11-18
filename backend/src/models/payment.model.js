const mongoose = require('mongoose');
const { PaymentStatus } = require('./enums');

const paymentSchema = new mongoose.Schema(
  {
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
      unique: true,
      index: true,
    },
    stripe_session_id: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    payment_date: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
  },
  { collection: 'payments', timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
