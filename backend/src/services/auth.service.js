const bcrypt = require('bcrypt');
const Client = require('../models/client.model');

/**
 * Service to register a new client
 * Takes normal parameters: first_name, last_name, email, password, phone
 */
async function registerClient(first_name, last_name, email, password, phone = '') {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if email is already registered
  const existing = await Client.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  // 2. Hash password with bcrypt (cost 12)
  const password_hash = await bcrypt.hash(password, 12);

  // 3. Save new client in MongoDB
  const newClient = await Client.create({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normalizedEmail,
    password_hash,
    phone: phone ? phone.trim() : '',
  });

  // 4. Return clean client profile (omit password_hash)
  return {
    _id: newClient._id,
    first_name: newClient.first_name,
    last_name: newClient.last_name,
    email: newClient.email,
    phone: newClient.phone,
    createdAt: newClient.createdAt,
  };
}

module.exports = {
  registerClient,
};
