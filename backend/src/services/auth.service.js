const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Client = require('../models/client.model');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_client_jwt_secret';
const JWT_EXPIRES_IN = '24h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

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

async function loginClient(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const client = await Client.findOne({ email: normalizedEmail });
  if (!client) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, client.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken({
    id: client._id.toString(),
    email: client.email,
  });

  const clientData = {
    _id: client._id,
    first_name: client.first_name,
    last_name: client.last_name,
    email: client.email,
    phone: client.phone,
    createdAt: client.createdAt,
  };

  return {
    client: clientData,
    token,
  };
}

async function getClientProfile(clientId) {
  const client = await Client.findById(clientId).select('-password_hash -reset_token -reset_token_expires');
  if (!client) {
    const err = new Error('Client not found');
    err.status = 404;
    throw err;
  }
  return client;
}

module.exports = {
  registerClient,
  loginClient,
  getClientProfile,
  generateToken,
};
