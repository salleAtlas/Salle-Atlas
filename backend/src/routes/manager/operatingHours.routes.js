const router = require('express').Router();
const { validateOperatingHours } = require('../../middlewares/validators/operatingHours.validator');
const { showOperatingHours, updateOperatingHours } = require('../../controllers/manager/managerOperatingHours.controller');

try {
  const requireManager = require('../../middlewares/requireManager.middleware');
  if (typeof requireManager === 'function') {
    router.use(requireManager);
  }
} catch {
  // requireManager middleware optionnel en attendant A3
}

// Mounted at /manager/operating-hours behind requireManager (A3)
router.get('/', showOperatingHours);
router.put('/', validateOperatingHours, updateOperatingHours);

module.exports = router;
