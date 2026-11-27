const mongoose = require('mongoose');
const Space = require('./space.model');
const Reservation = require('./reservation.model');
const { ReservationStatus } = require('./enums');

const openSpaceSchema = new mongoose.Schema({
  total_seats: { type: Number, required: true, min: 1, default: 30 },
  price_per_hour_per_seat: { type: Number, required: true, min: 0.01 },
});

// Seats already taken by active reservations overlapping [start, end)
openSpaceSchema.methods.get_remaining_seats = async function (start, end) {
  const [{ taken = 0 } = {}] = await Reservation.aggregate([
    {
      $match: {
        space_id: this._id,
        start_time: { $lt: new Date(end) },
        end_time: { $gt: new Date(start) },
        $or: [
          { status: ReservationStatus.CONFIRMED },
          { status: ReservationStatus.PENDING, pending_expires_at: { $gt: new Date() } },
        ],
      },
    },
    { $group: { _id: null, taken: { $sum: '$number_of_people' } } },
  ]);
  return Math.max(this.total_seats - taken, 0);
};

openSpaceSchema.methods.is_available = async function (start, end, people = 1) {
  return this.is_active && (await this.get_remaining_seats(start, end)) >= people;
};

module.exports = Space.discriminator('open_space', openSpaceSchema);
