const crypto = require('crypto');
const env = require('../config/env.config');
const { toManagerAuthResultDto } = require('../mappers/managerAuth.mapper');

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyManagerCredentials(dto) {
  const email = String(dto?.email || '').trim().toLowerCase();
  const password = String(dto?.password || '');

  const expectedEmail = String(env.MANAGER_EMAIL).trim().toLowerCase();
  const expectedPassword = String(env.MANAGER_PASSWORD);

  const isValid = safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);

  return toManagerAuthResultDto(isValid, env.MANAGER_EMAIL);
}

module.exports = {
  safeEqual,
  verifyManagerCredentials,
};
