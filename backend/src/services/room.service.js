const roomRepository = require('../repositories/room.repository');
const equipmentRepository = require('../repositories/equipment.repository');
const reservationRepository = require('../repositories/reservation.repository');
const { toRoomDto } = require('../mappers/space.mapper');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function checkEquipments(ids) {
  for (const id of ids) {
    const equipment = await equipmentRepository.findById(id);
    if (!equipment) {
      throw makeError('Equipement introuvable.', 400);
    }
  }
}

async function listRooms() {
  const rooms = await roomRepository.findAll();
  const result = [];
  for (const room of rooms) {
    result.push(toRoomDto(room));
  }
  return result;
}

async function getRoom(id) {
  const room = await roomRepository.findById(id);
  if (!room) {
    throw makeError('Salle introuvable.', 404);
  }
  return toRoomDto(room);
}

async function createRoom(dto) {
  await checkEquipments(dto.equipments);
  try {
    const room = await roomRepository.create(dto);
    return toRoomDto(room);
  } catch (err) {
    if (err.code === 11000) {
      throw makeError('Un espace avec ce nom existe deja.', 400);
    }
    throw err;
  }
}

async function updateRoom(id, dto) {
  await checkEquipments(dto.equipments);
  try {
    const room = await roomRepository.updateById(id, dto);
    if (!room) {
      throw makeError('Salle introuvable.', 404);
    }
    return toRoomDto(room);
  } catch (err) {
    if (err.code === 11000) {
      throw makeError('Un espace avec ce nom existe deja.', 400);
    }
    throw err;
  }
}

async function deleteRoom(id) {
  const count = await reservationRepository.countFutureActiveBySpace(id);
  if (count > 0) {
    throw makeError('Cette salle a des reservations a venir et ne peut pas etre supprimee.', 400);
  }
  const room = await roomRepository.deleteById(id);
  if (!room) {
    throw makeError('Salle introuvable.', 404);
  }
  return toRoomDto(room);
}

module.exports = {
  listRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};
