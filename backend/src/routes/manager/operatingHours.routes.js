const router = require('express').Router();
const { validateOperatingHours } = require('../../middlewares/validators/operatingHours.validator');
const { showOperatingHours, updateOperatingHours } = require('../../controllers/manager/managerOperatingHours.controller');

// Mounted behind requireManager in routes/manager/index.routes.js
router.get('/', showOperatingHours);
router.put('/', validateOperatingHours, updateOperatingHours);

module.exports = router;
