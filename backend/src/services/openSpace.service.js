const openSpaceRepository = require('../repositories/openSpace.repository');
const reservationRepository = require('../repositories/reservation.repository');
const { toOpenSpaceDto } = require('../mappers/space.mapper');

async function getOpenSpace() {
  const doc = await openSpaceRepository.findSingleton();
  return toOpenSpaceDto(doc);
}

async function updateOpenSpace(dto) {
  const updated = await openSpaceRepository.updateSingleton(dto);
  if (!updated) {
    throw Object.assign(new Error('Open space introuvable'), { status: 404 });
  }
  return toOpenSpaceDto(updated);
}

async function getRemainingSeats(start, end) {
  const space = await openSpaceRepository.findSingleton();
  if (!space) {
    throw Object.assign(new Error('Open space introuvable'), { status: 404 });
  }
  const taken = await reservationRepository.sumOverlappingActivePeople(space._id, start, end);
  return Math.max(space.total_seats - taken, 0);
}

async function isAvailable(start, end, people = 1) {
  const space = await openSpaceRepository.findSingleton();
  if (!space || !space.is_active) return false;
  const remaining = await getRemainingSeats(start, end);
  return remaining >= people;
}

module.exports = {
  getOpenSpace,
  updateOpenSpace,
  getRemainingSeats,
  isAvailable,
};
