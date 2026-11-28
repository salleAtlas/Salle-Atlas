const cron = require('node-cron');
const env = require('../config/env.config');
const reservationRepo = require('../repositories/reservation.repository');

// expire pending reservations older than 10 minutes
async function runExpirySweep() {
  try {
    const result = await reservationRepo.expirePendingReservations(new Date());
    if (result.modifiedCount > 0) {
      console.log('Expired pending reservations:', result.modifiedCount);
    }
    return result;
  } catch (err) {
    console.error('Expiry sweep failed:', err.message);
    return null;
  }
}

function startExpirePendingReservationsJob() {
  if (!env.ENABLE_IN_PROCESS_CRON) {
    return null;
  }

  const task = cron.schedule('* * * * *', () => {
    runExpirySweep();
  });

  console.log('Pending reservation expiry cron started');
  return task;
}

module.exports = {
  runExpirySweep,
  startExpirePendingReservationsJob,
};
