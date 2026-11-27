const { matchedData } = require('express-validator');
const { UpdateDurationLimitsDto } = require('../../dtos/setting.dto');
const settingService = require('../../services/setting.service');

const wantsJson = (req) => req.accepts(['html', 'json']) === 'json';

async function showDurationLimits(req, res) {
  const settings = await settingService.getSettings();
  if (wantsJson(req)) return res.json({ settings });
  res.render('manager/settings/duration-limits', { settings, flash: res.locals.flash || {} });
}

// Always updates the single seeded GlobalSetting document, never creates a new one
async function updateDurationLimits(req, res) {
  const dto = new UpdateDurationLimitsDto(matchedData(req));
  const settings = await settingService.updateDurationLimits(dto);

  if (wantsJson(req)) return res.json({ settings });
  if (req.session) req.session.flash = { success: 'Limites de duree mises a jour.' };
  res.redirect('/manager/duration-limits');
}

module.exports = { showDurationLimits, updateDurationLimits };
