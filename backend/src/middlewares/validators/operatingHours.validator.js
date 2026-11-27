const { body, validationResult } = require('express-validator');

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

// Accepts a real array (JSON API) or a comma-separated string (plain HTML form) and
// always produces an array, so the EJS form and the JSON clients share one validator.
const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
  return value;
};

const validateOperatingHours = [
  body('opening_time').matches(HHMM).withMessage("L'heure d'ouverture doit etre au format HH:MM"),
  body('closing_time')
    .matches(HHMM).withMessage('La fermeture doit etre au format HH:MM')
    .bail()
    .custom((value, { req }) => value > req.body.opening_time)
    .withMessage("La fermeture doit etre apres l'ouverture"),
  body('closed_days_of_week')
    .customSanitizer(toArray)
    .isArray().withMessage('Les jours fermes doivent etre une liste')
    .bail()
    .customSanitizer((value) => value.map((d) => Number(d)))
    .custom((value) => value.every((d) => Number.isInteger(d) && d >= 0 && d <= 6))
    .withMessage('Chaque jour ferme doit etre un entier entre 0 (dimanche) et 6 (samedi)'),
  body('specific_closed_dates')
    .customSanitizer(toArray)
    .isArray().withMessage('Les dates fermees doivent etre une liste')
    .bail()
    .custom((value) => value.every((d) => YMD.test(d)))
    .withMessage('Chaque date fermee doit etre au format YYYY-MM-DD'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const error = errors.array().map((e) => e.msg).join(', ');
    if (req.accepts(['html', 'json']) === 'json') return res.status(400).json({ error });
    if (req.session) req.session.flash = { error };
    res.redirect('/manager/operating-hours');
  },
];

module.exports = { validateOperatingHours };
