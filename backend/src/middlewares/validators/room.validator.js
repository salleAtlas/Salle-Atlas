const { body, param, validationResult } = require('express-validator');

function sendErrors(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const error = errors.array().map((e) => e.msg).join(', ');
  if (req.accepts(['html', 'json']) === 'json') return res.status(400).json({ error });
  if (req.session) req.session.flash = { error };
  if (req.params.id && req.method === 'PUT') return res.redirect('/manager/rooms/' + req.params.id + '/edit');
  if (req.method === 'POST') return res.redirect('/manager/rooms/new');
  res.redirect('/manager/rooms');
}

const validateRoomId = [
  param('id').isMongoId().withMessage('Identifiant de salle invalide'),
  sendErrors,
];

const validateRoom = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('capacity').isInt({ min: 1 }).withMessage('La capacite doit etre un entier >= 1'),
  body('price_per_hour').isFloat({ gt: 0 }).withMessage('Le prix doit etre superieur a 0'),
  body('equipments').optional().isMongoId().withMessage('Equipement invalide'),
  sendErrors,
];

module.exports = { validateRoomId, validateRoom };
