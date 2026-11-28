const OpenSpace = require('../models/open_space.model');

async function findSingleton() {
  return OpenSpace.findOne();
}

async function createSingleton(data) {
  return OpenSpace.create(data);
}

async function updateSingleton(data) {
  return OpenSpace.findOneAndUpdate(
    {},
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  );
}

module.exports = {
  findSingleton,
  createSingleton,
  updateSingleton,
};
