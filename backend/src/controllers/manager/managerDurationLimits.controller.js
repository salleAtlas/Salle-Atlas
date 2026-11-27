const { matchedData } = require('express-validator');
const GlobalSetting = require('../../models/global_setting.model');

const wantsJson = (req) => req.accepts(['html', 'json']) === 'json';

async function showDurationLimits(req, res) {
  const settings = await GlobalSetting.findOne();
  if (wantsJson(req)) return res.json({ settings });
  res.render('manager/settings/duration-limits', { settings, flash: res.locals.flash || {} });
}

// Always updates the single seeded GlobalSetting document, never creates a new one
async function updateDurationLimits(req, res) {
  const settings = await GlobalSetting.findOne();
  if (!settings) throw Object.assign(new Error('Parametres introuvables'), { status: 404 });

  await settings.update_limits(matchedData(req));

  if (wantsJson(req)) return res.json({ settings });
  if (req.session) req.session.flash = { success: 'Limites de duree mises a jour.' };
  res.redirect('/manager/duration-limits');
}

module.exports = { showDurationLimits, updateDurationLimits };
