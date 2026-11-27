const mongoose = require('mongoose');

const globalSettingSchema = new mongoose.Schema(
  {
    min_duration_hours: { type: Number, default: 1, min: 1 },
    max_duration_hours: { type: Number, default: 8, min: 1 },
    opening_time: { type: String, default: '08:00' },
    closing_time: { type: String, default: '20:00' },
    closed_days_of_week: { type: [Number], default: [0] },
    specific_closed_dates: { type: [String], default: [] },
  },
  { collection: 'global_settings', timestamps: true }
);

module.exports = mongoose.model('GlobalSetting', globalSettingSchema);
