const router = require('express').Router();
const { validateOpenSpace } = require('../../middlewares/validators/openSpace.validator');
const { showOpenSpace, updateOpenSpace } = require('../../controllers/manager/managerOpenSpace.controller');

// Mounted at /manager/open-space behind requireManager (A3)
router.get('/', showOpenSpace);
router.put('/', validateOpenSpace, updateOpenSpace);

module.exports = router;
