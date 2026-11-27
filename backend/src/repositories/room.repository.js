const Room = require('../models/room.model');

async function findAllWithEquipments() {
  return Room.find({ space_type: 'room' }).select('name equipments');
}

async function countByEquipmentId(equipmentId) {
  return Room.countDocuments({ equipments: equipmentId });
}

async function findAll() {
  return Room.find().populate('equipments').sort({ name: 1 });
}

async function findById(id) {
  return Room.findById(id).populate('equipments');
}

async function create(data) {
  return Room.create(data);
}

async function updateById(id, data) {
  return Room.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true });
}

async function deleteById(id) {
  return Room.findByIdAndDelete(id);
}

module.exports = {
  findAllWithEquipments,
  countByEquipmentId,
  findAll,
  findById,
  create,
  updateById,
  deleteById,
};
