const Room = require('../models/room.model');

async function findAllWithEquipments() {
  return Room.find({ space_type: 'room' }).select('name equipments');
}

async function countByEquipmentId(equipmentId) {
  return Room.countDocuments({ equipments: equipmentId });
}

module.exports = {
  findAllWithEquipments,
  countByEquipmentId,
};
