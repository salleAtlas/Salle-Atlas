const GlobalSetting = require('../models/global_setting.model');

async function findSingleton() {
  return GlobalSetting.findOne();
}

async function createSingleton(data) {
  return GlobalSetting.create(data);
}

async function updateSingleton(fields) {
  return GlobalSetting.findOneAndUpdate(
    {},
    { $set: fields },
    { returnDocument: 'after', runValidators: true }
  );
}

module.exports = {
  findSingleton,
  createSingleton,
  updateSingleton,
};
