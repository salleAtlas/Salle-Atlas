const express = require('express');
const router = express.Router();
const {
  validateEquipment,
  checkEquipmentNotUsed,
} = require('../../middlewares/validators/equipment.validator');
const managerEquipmentController = require('../../controllers/manager/managerEquipment.controller');

// Mounted behind requireManager in routes/manager/index.routes.js

router.get('/', managerEquipmentController.listEquipments);
router.post('/', validateEquipment, managerEquipmentController.createEquipment);
router.put('/:id', validateEquipment, managerEquipmentController.updateEquipment);
router.delete('/:id', checkEquipmentNotUsed, managerEquipmentController.deleteEquipment);

module.exports = router;
