const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db.config');
const { runInitialSeed } = require('../src/seeds/init.seed');

jest.setTimeout(15000);

async function clearTestCollections() {
  if (mongoose.connection.readyState !== 1) return;
  if (!mongoose.connection.name.endsWith('_test')) {
    throw new Error(`Refusing to clear non-test database: ${mongoose.connection.name}`);
  }
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

beforeAll(async () => {
  await connectDB();
  await clearTestCollections();
  await runInitialSeed();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await clearTestCollections();
    await mongoose.disconnect();
  }
});
