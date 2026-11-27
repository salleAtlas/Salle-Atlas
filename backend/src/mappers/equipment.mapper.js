function toEquipmentDto(doc) {
  if (!doc) return null;
  return {
    _id: doc._id,
    name: doc.name,
    icon: doc.icon,
    description: doc.description,
    is_active: doc.is_active,
  };
}

function toEquipmentListDto(docs) {
  return (docs || []).map(toEquipmentDto);
}

module.exports = {
  toEquipmentDto,
  toEquipmentListDto,
};
