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

clientSchema.statics.register = async function (first_name, last_name, email, password, phone) {
  const authService = require('../services/auth.service');
  return authService.registerClient(first_name, last_name, email, password, phone);
};

clientSchema.statics.login = async function (email, password) {
  const authService = require('../services/auth.service');
  return authService.loginClient(email, password);
};

module.exports = mongoose.model('Client', clientSchema);
