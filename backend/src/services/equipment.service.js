const equipmentRepository = require('../repositories/equipment.repository');
const roomRepository = require('../repositories/room.repository');
const { toEquipmentDto, toEquipmentListDto } = require('../mappers/equipment.mapper');

async function listEquipmentsWithUsage() {
  const equipments = await equipmentRepository.findAllSorted();
  const rooms = await roomRepository.findAllWithEquipments();

  const usageMap = {};
  for (const eq of equipments) {
    const id = eq._id.toString();
    const usedIn = rooms.filter(
      (r) => r.equipments && r.equipments.some((e) => e.toString() === id)
    );
    usageMap[id] = usedIn.map((r) => r.name);
  }

  return {
    equipments: toEquipmentListDto(equipments),
    usageMap,
  };
}

async function isEquipmentUsed(equipmentId) {
  const count = await roomRepository.countByEquipmentId(equipmentId);
  return count > 0;
}

async function createEquipment(dto) {
  try {
    const created = await equipmentRepository.create({
      name: dto.name,
      icon: dto.icon,
      description: dto.description,
    });
    return toEquipmentDto(created);
  } catch (err) {
    if (err.code === 11000) {
      throw Object.assign(new Error('Un equipement avec ce nom existe deja.'), { status: 400 });
    }
    throw err;
  }
}

async function updateEquipment(id, dto) {
  try {
    const updated = await equipmentRepository.updateById(id, dto);
    if (!updated) {
      throw Object.assign(new Error('Equipement introuvable.'), { status: 404 });
    }
    return toEquipmentDto(updated);
  } catch (err) {
    if (err.code === 11000) {
      throw Object.assign(new Error('Un equipement avec ce nom existe deja.'), { status: 400 });
    }
    throw err;
  }
}

async function deleteEquipment(id) {
  if (await isEquipmentUsed(id)) {
    throw Object.assign(new Error('Ce equipement est utilise par une salle et ne peut pas etre supprime.'), { status: 400 });
  }

  const deleted = await equipmentRepository.deleteById(id);
  if (!deleted) {
    throw Object.assign(new Error('Equipement introuvable.'), { status: 404 });
  }
  return toEquipmentDto(deleted);
}

module.exports = {
  listEquipmentsWithUsage,
  isEquipmentUsed,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
