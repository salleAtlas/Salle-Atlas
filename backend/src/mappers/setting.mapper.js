function toGlobalSettingDto(doc) {
  if (!doc) return null;
  return {
    _id: doc._id,
    min_duration_hours: doc.min_duration_hours,
    max_duration_hours: doc.max_duration_hours,
    opening_time: doc.opening_time,
    closing_time: doc.closing_time,
    closed_days_of_week: doc.closed_days_of_week,
    specific_closed_dates: doc.specific_closed_dates,
  };
}

module.exports = {
  toGlobalSettingDto,
};
