const { matchedData } = require('express-validator');
const OpenSpace = require('../../models/open_space.model');

const wantsJson = (req) => req.accepts(['html', 'json']) === 'json';

async function showOpenSpace(req, res) {
  const openSpace = await OpenSpace.findOne();
  if (wantsJson(req)) return res.json({ openSpace });
  res.render('manager/open-space/edit', { openSpace, flash: res.locals.flash || {} });
}

// Always updates the single seeded document, never creates a new one
async function updateOpenSpace(req, res) {
  const openSpace = await OpenSpace.findOneAndUpdate({}, matchedData(req), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!openSpace) throw Object.assign(new Error('Open space introuvable'), { status: 404 });
  if (wantsJson(req)) return res.json({ openSpace });
  if (req.session) req.session.flash = { success: 'Open space mis a jour.' };
  res.redirect('/manager/open-space');
}

module.exports = { showOpenSpace, updateOpenSpace };
