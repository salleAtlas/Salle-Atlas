const bcrypt = require('bcrypt');
const Client = require('../models/client.model');

async function registerClient(first_name, last_name, email, password, phone = '') {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await Client.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const password_hash = await bcrypt.hash(password, 12);


  const newClient = await Client.create({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normalizedEmail,
    password_hash,
    phone: phone ? phone.trim() : '',
  });

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
