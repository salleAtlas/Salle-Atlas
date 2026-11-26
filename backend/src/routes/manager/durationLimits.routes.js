const router = require('express').Router();
const { validateDurationLimits } = require('../../middlewares/validators/durationLimits.validator');
const { showDurationLimits, updateDurationLimits } = require('../../controllers/manager/managerDurationLimits.controller');

try {
  const requireManager = require('../../middlewares/requireManager.middleware');
  if (typeof requireManager === 'function') {
    router.use(requireManager);
  }
} catch {
  // requireManager middleware optionnel en attendant A3
}

// Mounted at /manager/duration-limits behind requireManager (A3)
router.get('/', showDurationLimits);
router.put('/', validateDurationLimits, updateDurationLimits);

module.exports = router;
