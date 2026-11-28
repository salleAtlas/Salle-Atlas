const os = require('node:os');
const mongoose = require('mongoose');
const env = require('./env.config');

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(env.MONGODB_URI, {
    runtimeAdapters: { os },
  });
  if (process.env.NODE_ENV !== 'test') {
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  }
}

module.exports = { connectDB };
