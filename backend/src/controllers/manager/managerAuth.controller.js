const { ManagerLoginDto } = require('../../dtos/managerAuth.dto');
const managerAuthService = require('../../services/managerAuth.service');

const wantsJson = (req) => Boolean(req.xhr || req.accepts(['html', 'json']) === 'json');

function renderLogin(req, res) {
  if (req.session && req.session.isManager === true) {
    return res.redirect('/manager/equipments');
  }

  return res.render('manager/login', {
    layout: false,
    pageTitle: 'Connexion Manager — Salle Atlas',
    flash: res.locals.flash || {},
  });
}

function login(req, res, next) {
  const dto = new ManagerLoginDto(req.body);
  const result = managerAuthService.verifyManagerCredentials(dto);

  if (!result.isAuthenticated) {
    if (wantsJson(req)) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    if (req.session) {
      req.session.flash = { error: 'Email ou mot de passe incorrect.' };
      if (typeof req.session.save === 'function') {
        return req.session.save((err) => {
          if (err) return next(err);
          res.redirect('/manager/login');
        });
      }
    }
    return res.redirect('/manager/login');
  }

  req.session.regenerate((regenErr) => {
    if (regenErr) return next(regenErr);
    req.session.isManager = true;
    req.session.managerEmail = result.managerEmail;
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr);
      if (wantsJson(req)) {
        return res.status(200).json({ message: 'Connexion reussie', isManager: true });
      }
      return res.redirect('/manager/equipments');
    });
  });
}

function logout(req, res, next) {
  if (!req.session) {
    res.clearCookie('connect.sid');
    if (wantsJson(req)) {
      return res.status(200).json({ message: 'Deconnexion reussie' });
    }
    return res.redirect('/manager/login');
  }

  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    if (wantsJson(req)) {
      return res.status(200).json({ message: 'Deconnexion reussie' });
    }
    return res.redirect('/manager/login');
  });
}

module.exports = {
  renderLogin,
  login,
  logout,
};
