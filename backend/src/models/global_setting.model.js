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

// B6 — update opening/closing time, closed days of week and specific closed dates.
// Only touches the fields that are passed in, so a B7 (duration limits) update
// made through update_limits() is never clobbered by this method, and vice versa.
globalSettingSchema.methods.update_hours = async function (fields = {}) {
  const { opening_time, closing_time, closed_days_of_week, specific_closed_dates } = fields;
  if (opening_time !== undefined) this.opening_time = opening_time;
  if (closing_time !== undefined) this.closing_time = closing_time;
  if (closed_days_of_week !== undefined) this.closed_days_of_week = closed_days_of_week;
  if (specific_closed_dates !== undefined) this.specific_closed_dates = specific_closed_dates;
  return this.save();
};

// B6/C1 — true when [start, end) falls on an open day/date and inside opening_time..closing_time.
// Times are compared in UTC (same convention as reservation.model.js) and slots must not cross midnight.
globalSettingSchema.methods.is_within_operating_hours = function (start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const toYMD = (d) => d.toISOString().slice(0, 10);
  const toHHMM = (d) => `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;

  if (this.closed_days_of_week.includes(startDate.getUTCDay())) return false;
  if (this.specific_closed_dates.includes(toYMD(startDate))) return false;
  if (toYMD(startDate) !== toYMD(endDate)) return false;

  return toHHMM(startDate) >= this.opening_time && toHHMM(endDate) <= this.closing_time;
};

module.exports = mongoose.model('GlobalSetting', globalSettingSchema);
