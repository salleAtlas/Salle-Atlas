class CreateEquipmentDto {
  constructor({ name, icon, description } = {}) {
    this.name = String(name || '').trim();
    this.icon = (icon && String(icon).trim()) || 'bi-gear';
    this.description = description ? String(description).trim() : '';
  }
}

class UpdateEquipmentDto {
  constructor({ name, icon, description } = {}) {
    if (name !== undefined) this.name = String(name).trim();
    if (icon !== undefined) this.icon = String(icon).trim();
    if (description !== undefined) this.description = String(description).trim();
  }
}

module.exports = {
  CreateEquipmentDto,
  UpdateEquipmentDto,
};
