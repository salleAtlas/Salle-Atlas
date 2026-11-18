const mongoose = require('mongoose');
const env = require('./env.config');

async function connectDB() {
  await mongoose.connect(env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = { connectDB };
