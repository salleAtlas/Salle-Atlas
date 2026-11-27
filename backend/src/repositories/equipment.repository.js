const Equipment = require('../models/equipment.model');

async function findAllSorted() {
  return Equipment.find().sort({ name: 1 });
}

async function findById(id) {
  return Equipment.findById(id);
}

async function create(data) {
  return Equipment.create(data);
}

async function updateById(id, data) {
  return Equipment.findByIdAndUpdate(
    id,
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  );
}

async function deleteById(id) {
  return Equipment.findByIdAndDelete(id);
}

module.exports = {
  findAllSorted,
  findById,
  create,
  updateById,
  deleteById,
};
