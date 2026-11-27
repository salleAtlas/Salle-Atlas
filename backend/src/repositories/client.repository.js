const Client = require('../models/client.model');

async function findByEmail(email) {
  return Client.findOne({ email });
}

async function findById(id) {
  return Client.findById(id);
}

async function create(data) {
  return Client.create(data);
}

module.exports = {
  findByEmail,
  findById,
  create,
};
