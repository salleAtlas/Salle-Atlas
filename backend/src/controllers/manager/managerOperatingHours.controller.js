const { matchedData } = require('express-validator');
const GlobalSetting = require('../../models/global_setting.model');

const wantsJson = (req) => req.accepts(['html', 'json']) === 'json';

async function showOperatingHours(req, res) {
  const settings = await GlobalSetting.findOne();
  if (wantsJson(req)) return res.json({ settings });
  res.render('manager/settings/operating-hours', { settings, flash: res.locals.flash || {} });
}

// Always updates the single seeded GlobalSetting document, never creates a new one
async function updateOperatingHours(req, res) {
  const settings = await GlobalSetting.findOne();
  if (!settings) throw Object.assign(new Error('Parametres introuvables'), { status: 404 });

  await settings.update_hours(matchedData(req));

  if (wantsJson(req)) return res.json({ settings });
  if (req.session) req.session.flash = { success: "Horaires d'ouverture mis a jour." };
  res.redirect('/manager/operating-hours');
}

module.exports = { showOperatingHours, updateOperatingHours };
