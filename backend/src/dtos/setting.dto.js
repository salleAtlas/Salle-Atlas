class UpdateOperatingHoursDto {
  constructor({ opening_time, closing_time, closed_days_of_week, specific_closed_dates } = {}) {
    if (opening_time !== undefined) this.opening_time = String(opening_time).trim();
    if (closing_time !== undefined) this.closing_time = String(closing_time).trim();
    if (closed_days_of_week !== undefined) this.closed_days_of_week = closed_days_of_week.map(Number);
    if (specific_closed_dates !== undefined) this.specific_closed_dates = specific_closed_dates.map((d) => String(d).trim());
  }
}

class UpdateDurationLimitsDto {
  constructor({ min_duration_hours, max_duration_hours } = {}) {
    if (min_duration_hours !== undefined) this.min_duration_hours = Number(min_duration_hours);
    if (max_duration_hours !== undefined) this.max_duration_hours = Number(max_duration_hours);
  }
}

module.exports = {
  UpdateOperatingHoursDto,
  UpdateDurationLimitsDto,
};
