const router = require('express').Router();
const { requireManager } = require('../../middlewares/requireManager.middleware');
const authRoutes = require('./auth.routes');
const equipmentRoutes = require('./equipment.routes');
const openSpaceRoutes = require('./openSpace.routes');
const operatingHoursRoutes = require('./operatingHours.routes');
const durationLimitsRoutes = require('./durationLimits.routes');

// Public manager auth routes
router.use('/', authRoutes);

// Protect all remaining /manager/* routes
router.use(requireManager);

// Default manager landing page
router.get('/', (req, res) => res.redirect('/manager/equipments'));

// Wave 1 manager modules
router.use('/equipments', equipmentRoutes);
router.use('/open-space', openSpaceRoutes);
router.use('/operating-hours', operatingHoursRoutes);
router.use('/duration-limits', durationLimitsRoutes);

// Wave 2 & 3 manager modules mounted by subsequent PRs:
// router.use('/rooms', roomRoutes);
// router.use('/scanner', scannerRoutes);
// router.use('/calendar', calendarRoutes);
// router.use('/dashboard', dashboardRoutes);

module.exports = router;
