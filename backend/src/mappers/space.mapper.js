function toOpenSpaceDto(doc, remainingSeats) {
  if (!doc) return null;
  return {
    _id: doc._id,
    space_type: doc.space_type,
    name: doc.name,
    description: doc.description,
    is_active: doc.is_active,
    total_seats: doc.total_seats,
    price_per_hour_per_seat: doc.price_per_hour_per_seat,
    ...(remainingSeats !== undefined ? { remaining_seats: remainingSeats } : {}),
  };
}

function toRoomDto(doc) {
  if (!doc) return null;
  return {
    _id: doc._id,
    space_type: doc.space_type,
    name: doc.name,
    description: doc.description,
    is_active: doc.is_active,
    capacity: doc.capacity,
    price_per_hour: doc.price_per_hour,
    photos: doc.photos,
    equipments: doc.equipments,
  };
}

module.exports = {
  toOpenSpaceDto,
  toRoomDto,
};
