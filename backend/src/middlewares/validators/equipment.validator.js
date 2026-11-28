const { body, validationResult } = require('express-validator');
const equipmentService = require('../../services/equipment.service');

const validateEquipment = [
  body('name').trim().notEmpty()
    .withMessage("Le nom de l'equipement est requis")
    .isLength({ max: 100 }).withMessage('Le nom ne doit pas depasser 100 caracteres'),
  body('icon').optional().trim(),
  body('description').optional().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array().map((e) => e.msg).join(', ');
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ error: errorMsg });
      }
      if (req.session) {
        req.session.flash = { error: errorMsg };
      }
      return res.redirect('/manager/equipments');
    }
    next();
  },
];

const checkEquipmentNotUsed = async (req, res, next) => {
  try {
    const isUsed = await equipmentService.isEquipmentUsed(req.params.id);
    if (isUsed) {
      const errorMsg = 'Ce equipement est utilise par une salle et ne peut pas etre supprime.';
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ error: errorMsg });
      }
      if (req.session) {
        req.session.flash = { error: errorMsg };
      }
      return res.redirect('/manager/equipments');
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validateEquipment,
  checkEquipmentNotUsed,
};
