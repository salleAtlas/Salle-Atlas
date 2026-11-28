const { matchedData } = require('express-validator');
const { UpdateOpenSpaceDto } = require('../../dtos/openSpace.dto');
const openSpaceService = require('../../services/openSpace.service');

const wantsJson = (req) => req.accepts(['html', 'json']) === 'json';

async function showOpenSpace(req, res) {
  const openSpace = await openSpaceService.getOpenSpace();
  if (wantsJson(req)) return res.json({ openSpace });
  res.render('manager/open-space/edit', { openSpace, flash: res.locals.flash || {} });
}

// Always updates the single seeded document, never creates a new one
async function updateOpenSpace(req, res) {
  const dto = new UpdateOpenSpaceDto(matchedData(req));
  const openSpace = await openSpaceService.updateOpenSpace(dto);
  if (wantsJson(req)) return res.json({ openSpace });
  if (req.session) req.session.flash = { success: 'Open space mis a jour.' };
  res.redirect('/manager/open-space');
}

module.exports = { showOpenSpace, updateOpenSpace };
