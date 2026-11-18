const env = require('./src/config/env.config');
const { connectDB } = require('./src/config/db.config');
const { runInitialSeed } = require('./src/seeds/init.seed');
const app = require('./src/app');

async function start() {
  await connectDB();
  await runInitialSeed();
  app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
