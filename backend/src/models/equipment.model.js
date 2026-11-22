const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    icon: { type: String, default: 'bi-gear' },
    description: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
  },
  { collection: 'equipments', timestamps: true }
);

equipmentSchema.methods.update_details = async function (name, icon, description) {
  if (name!==undefined) this.name= name.trim();
  if (icon!==undefined) this.icon=icon.trim();
  if (description !== undefined) this.description=description.trim();
  return this.save();
};

module.exports = mongoose.model('Equipment', equipmentSchema);
