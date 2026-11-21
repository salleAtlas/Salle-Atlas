require('dotenv').config({ quiet: true });

process.env.NODE_ENV = 'test';
process.env.ENABLE_IN_PROCESS_CRON = 'false';

const baseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salle_atlas_test';
const parsed = new URL(baseUri);
const dbName = parsed.pathname.replace(/^\//, '') || 'salle_atlas';
if (!dbName.endsWith('_test')) {
  parsed.pathname = `/${dbName}_test`;
}
process.env.MONGODB_URI = parsed.toString();

const defaults = {
  PORT: '5000',
  CLIENT_ORIGIN: 'http://localhost:4200',
  FRONTEND_URL: 'http://localhost:4200',
  APP_URL: 'http://localhost:5000',
  BASE_URL: 'http://localhost:5000',
  JWT_SECRET: 'ci-test-jwt-secret',
  JWT_EXPIRES_IN: '7d',
  QR_JWT_SECRET: 'ci-test-qr-jwt-secret',
  SESSION_SECRET: 'ci-test-session-secret',
  MANAGER_EMAIL: 'manager@salleatlas.test',
  MANAGER_PASSWORD: 'ci-test-password',
  STRIPE_SECRET_KEY: 'sk_test_placeholder',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
  STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  SMTP_USER: 'ci-test-user',
  SMTP_PASS: 'ci-test-pass',
  MAIL_FROM: 'no-reply@salleatlas.test',
  EMAIL_FROM: 'no-reply@salleatlas.test',
};

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}
