const globalSettingRepository = require('../repositories/globalSetting.repository');
const { toGlobalSettingDto } = require('../mappers/setting.mapper');

async function getSettings() {
  const doc = await globalSettingRepository.findSingleton();
  return toGlobalSettingDto(doc);
}

async function updateOperatingHours(dto) {
  const updated = await globalSettingRepository.updateSingleton(dto);
  if (!updated) {
    throw Object.assign(new Error('Parametres introuvables'), { status: 404 });
  }
  return toGlobalSettingDto(updated);
}

async function updateDurationLimits(dto) {
  const updated = await globalSettingRepository.updateSingleton(dto);
  if (!updated) {
    throw Object.assign(new Error('Parametres introuvables'), { status: 404 });
  }
  return toGlobalSettingDto(updated);
}

function isWithinOperatingHours(settings, start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const toYMD = (d) => d.toISOString().slice(0, 10);
  const toHHMM = (d) =>
    `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;

  if (settings.closed_days_of_week.includes(startDate.getUTCDay())) return false;
  if (settings.specific_closed_dates.includes(toYMD(startDate))) return false;
  if (toYMD(startDate) !== toYMD(endDate)) return false;

  return toHHMM(startDate) >= settings.opening_time && toHHMM(endDate) <= settings.closing_time;
}

async function checkOperatingHours(start, end) {
  const settings = await getSettings();
  return Boolean(settings) && isWithinOperatingHours(settings, start, end);
}

module.exports = {
  getSettings,
  updateOperatingHours,
  updateDurationLimits,
  isWithinOperatingHours,
  checkOperatingHours,
};
