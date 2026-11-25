const express = require('express');
const router = express.Router();
const {
  validateEquipment,
  checkEquipmentNotUsed,
} = require('../../middlewares/validators/equipment.validator');
const managerEquipmentController = require('../../controllers/manager/managerEquipment.controller');

try {
  const requireManager = require('../../middlewares/requireManager.middleware');
  if (typeof requireManager === 'function') {
    router.use(requireManager);
  }
} catch {
  // middleware manager optionnel en attendant A3
}

router.get('/', managerEquipmentController.listEquipments);
router.post('/', validateEquipment, managerEquipmentController.createEquipment);
router.put('/:id', validateEquipment, managerEquipmentController.updateEquipment);
router.delete('/:id', checkEquipmentNotUsed, managerEquipmentController.deleteEquipment);

module.exports = router;
