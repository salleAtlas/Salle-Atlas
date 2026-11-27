const { body, validationResult } = require('express-validator');

const validateDurationLimits = [
  body('min_duration_hours')
    .isInt({ min: 1 }).withMessage('La duree minimale doit etre un entier >= 1')
    .toInt(),
  body('max_duration_hours')
    .isInt({ min: 1 }).withMessage('La duree maximale doit etre un entier >= 1')
    .bail()
    .toInt()
    .custom((value, { req }) => value >= req.body.min_duration_hours)
    .withMessage('La duree maximale doit etre superieure ou egale a la duree minimale'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const error = errors.array().map((e) => e.msg).join(', ');
    if (req.accepts(['html', 'json']) === 'json') return res.status(400).json({ error });
    if (req.session) req.session.flash = { error };
    res.redirect('/manager/duration-limits');
  },
];

module.exports = { validateDurationLimits };
