const Reservation = require('../models/reservation.model');
const { ReservationStatus } = require('../models/enums');

async function sumOverlappingActivePeople(spaceId, start, end, now = new Date()) {
  const [{ taken = 0 } = {}] = await Reservation.aggregate([
    {
      $match: {
        space_id: spaceId,
        start_time: { $lt: new Date(end) },
        end_time: { $gt: new Date(start) },
        $or: [
          { status: ReservationStatus.CONFIRMED },
          { status: ReservationStatus.PENDING, pending_expires_at: { $gt: now } },
        ],
      },
    },
    { $group: { _id: null, taken: { $sum: '$number_of_people' } } },
  ]);
  return taken;
}

// find reservation by id
async function findById(id) {
  return Reservation.findById(id);
}

// mark reservation as confirmed after payment
async function confirmReservation(id) {
  return Reservation.findByIdAndUpdate(
    id,
    { $set: { status: ReservationStatus.CONFIRMED } },
    { new: true }
  );
}

// mark one pending reservation as expired
async function expireReservation(id) {
  return Reservation.findOneAndUpdate(
    { _id: id, status: ReservationStatus.PENDING },
    { $set: { status: ReservationStatus.EXPIRED } },
    { new: true }
  );
}

// expire all pending reservations past their 10 min limit
async function expirePendingReservations(now = new Date()) {
  return Reservation.updateMany(
    {
      status: ReservationStatus.PENDING,
      pending_expires_at: { $lte: now },
    },
    { $set: { status: ReservationStatus.EXPIRED } }
  );
}

module.exports = {
  sumOverlappingActivePeople,
  findById,
  confirmReservation,
  expireReservation,
  expirePendingReservations,
};
