const { matchedData } = require('express-validator');
const { UpdateOperatingHoursDto } = require('../../dtos/setting.dto');
const settingService = require('../../services/setting.service');

const wantsJson = (req) => req.accepts(['html', 'json']) === 'json';

async function showOperatingHours(req, res) {
  const settings = await settingService.getSettings();
  if (wantsJson(req)) return res.json({ settings });
  res.render('manager/settings/operating-hours', { settings, flash: res.locals.flash || {} });
}

// Always updates the single seeded GlobalSetting document, never creates a new one
async function updateOperatingHours(req, res) {
  const dto = new UpdateOperatingHoursDto(matchedData(req));
  const settings = await settingService.updateOperatingHours(dto);

  if (wantsJson(req)) return res.json({ settings });
  if (req.session) req.session.flash = { success: "Horaires d'ouverture mis a jour." };
  res.redirect('/manager/operating-hours');
}

module.exports = { showOperatingHours, updateOperatingHours };
