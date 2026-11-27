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

module.exports = mongoose.model('Equipment', equipmentSchema);
