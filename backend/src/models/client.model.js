const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true },
    phone: { type: String, default: '' },
    reset_token: { type: String, default: null, index: true },
    reset_token_expires: { type: Date, default: null },
  },
  { collection: 'clients', timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
