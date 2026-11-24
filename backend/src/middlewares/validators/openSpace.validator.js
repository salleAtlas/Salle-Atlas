const { body, validationResult } = require('express-validator');

const validateOpenSpace = [
  body('total_seats').isInt({ min: 1 }).withMessage('Le nombre de places doit etre un entier >= 1').toInt(),
  body('price_per_hour_per_seat').isFloat({ gt: 0 }).withMessage('Le prix doit etre superieur a 0').toFloat(),
  body(['name', 'description']).optional().trim().notEmpty().withMessage('Le nom et la description ne peuvent pas etre vides'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const error = errors.array().map((e) => e.msg).join(', ');
    if (req.accepts(['html', 'json']) === 'json') return res.status(400).json({ error });
    if (req.session) req.session.flash = { error };
    res.redirect('/manager/open-space');
  },
];

module.exports = { validateOpenSpace };
