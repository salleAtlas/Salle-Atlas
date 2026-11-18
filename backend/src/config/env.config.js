require('dotenv').config();

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'QR_JWT_SECRET',
  'SESSION_SECRET',
  'MANAGER_EMAIL',
  'MANAGER_PASSWORD',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  JWT_SECRET: process.env.JWT_SECRET,
  QR_JWT_SECRET: process.env.QR_JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  MANAGER_EMAIL: process.env.MANAGER_EMAIL,
  MANAGER_PASSWORD: process.env.MANAGER_PASSWORD,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  ENABLE_IN_PROCESS_CRON: process.env.ENABLE_IN_PROCESS_CRON === 'true',
};
