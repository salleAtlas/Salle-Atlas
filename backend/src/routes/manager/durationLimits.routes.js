const router = require('express').Router();
const { validateDurationLimits } = require('../../middlewares/validators/durationLimits.validator');
const { showDurationLimits, updateDurationLimits } = require('../../controllers/manager/managerDurationLimits.controller');

// Mounted behind requireManager in routes/manager/index.routes.js
router.get('/', showDurationLimits);
router.put('/', validateDurationLimits, updateDurationLimits);

module.exports = router;
