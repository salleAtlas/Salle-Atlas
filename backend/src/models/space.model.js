const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  { collection: 'spaces', discriminatorKey: 'space_type', timestamps: true }
);

module.exports = mongoose.model('Space', spaceSchema);
