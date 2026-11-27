function requireManager(req, res, next) {
  if (req.session && req.session.isManager === true) {
    return next();
  }

  const wantsJson = Boolean(req.xhr || req.accepts(['html', 'json']) === 'json');
  if (wantsJson) {
    return res.status(401).json({ error: 'Authentification manager requise.' });
  }

  if (req.session) {
    req.session.flash = { error: 'Veuillez vous connecter pour acceder a l espace manager.' };
  }
  return res.redirect('/manager/login');
}

module.exports = { requireManager };
