const crypto = require('crypto');
const env = require('../../config/env.config');

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

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
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const expectedEmail = String(env.MANAGER_EMAIL).trim().toLowerCase();
  const expectedPassword = String(env.MANAGER_PASSWORD);

  const isValid = safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);

  if (!isValid) {
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
    req.session.managerEmail = env.MANAGER_EMAIL;
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
