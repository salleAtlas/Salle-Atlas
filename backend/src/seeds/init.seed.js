const GlobalSetting = require('../models/global_setting.model');
const OpenSpace = require('../models/open_space.model');

async function runInitialSeed() {
  const existingSetting = await GlobalSetting.findOne();
  if (!existingSetting) {
    await GlobalSetting.create({
      min_duration_hours: 1,
      max_duration_hours: 8,
      opening_time: '08:00',
      closing_time: '20:00',
      closed_days_of_week: [0],
      specific_closed_dates: [],
    });
    console.log('Seeded singleton GlobalSetting');
  }

  const existingOpenSpace = await OpenSpace.findOne();
  if (!existingOpenSpace) {
    await OpenSpace.create({
      name: 'Main Open Space',
      description: 'Shared coworking open space with flexible seating.',
      is_active: true,
      total_seats: 30,
      price_per_hour_per_seat: 5,
    });
    console.log('Seeded singleton OpenSpace');
  }
}

module.exports = { runInitialSeed };
