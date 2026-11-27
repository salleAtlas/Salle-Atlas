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

async function countFutureActiveBySpace(spaceId) {
  const now = new Date();
  return Reservation.countDocuments({
    space_id: spaceId,
    end_time: { $gt: now },
    $or: [
      { status: ReservationStatus.CONFIRMED },
      { status: ReservationStatus.PENDING, pending_expires_at: { $gt: now } },
    ],
  });
}

module.exports = {
  sumOverlappingActivePeople,
  countFutureActiveBySpace,
};
