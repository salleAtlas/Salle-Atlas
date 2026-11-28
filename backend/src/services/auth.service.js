const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env.config');
const clientRepository = require('../repositories/client.repository');
const { toClientDto } = require('../mappers/client.mapper');

const JWT_EXPIRES_IN = '24h';

function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function registerClient(dto) {
  const existing = await clientRepository.findByEmail(dto.email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(dto.password, 12);

  const created = await clientRepository.create({
    first_name: dto.first_name,
    last_name: dto.last_name,
    email: dto.email,
    password_hash,
    phone: dto.phone || '',
  });

  return toClientDto(created);
}

async function loginClient(dto) {
  const client = await clientRepository.findByEmail(dto.email);
  if (!client) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(dto.password, client.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken({
    id: client._id.toString(),
    email: client.email,
  });

  return {
    client: toClientDto(client),
    token,
  };
}

async function getMeById(clientId) {
  const client = await clientRepository.findById(clientId);
  if (!client) {
    const err = new Error('Client account no longer exists');
    err.status = 401;
    throw err;
  }
  return toClientDto(client);
}

module.exports = {
  generateToken,
  registerClient,
  loginClient,
  getMeById,
};
