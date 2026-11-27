const { CreateEquipmentDto, UpdateEquipmentDto } = require('../../dtos/equipment.dto');
const equipmentService = require('../../services/equipment.service');

const listEquipments = async (req, res, next) => {
  try {
    const { equipments, usageMap } = await equipmentService.listEquipmentsWithUsage();

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ equipments, usageMap });
    }

    return res.render('manager/equipments/index', {
      equipments,
      usageMap,
      flash: res.locals.flash || {},
      pageTitle: 'Salles et equipements',
      activeTab: 'equipments',
    });
  } catch (err) {
    next(err);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const dto = new CreateEquipmentDto(req.body);
    const equipment = await equipmentService.createEquipment(dto);

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(201).json({ message: 'Equipement cree', equipment });
    }

    if (req.session) {
      req.session.flash = { success: 'Equipement ajoute avec succes.' };
    }
    return res.redirect('/manager/equipments');
  } catch (err) {
    if (err.status === 400) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ error: err.message });
      }
      if (req.session) {
        req.session.flash = { error: err.message };
      }
      return res.redirect('/manager/equipments');
    }
    next(err);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dto = new UpdateEquipmentDto(req.body);
    const equipment = await equipmentService.updateEquipment(id, dto);

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ message: 'Equipement modifie', equipment });
    }

    if (req.session) {
      req.session.flash = { success: 'Equipement modifie avec succes.' };
    }
    return res.redirect('/manager/equipments');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(err.status).json({ error: err.message });
      }
      if (req.session) {
        req.session.flash = { error: err.message };
      }
      return res.redirect('/manager/equipments');
    }
    next(err);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await equipmentService.deleteEquipment(id);

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ message: 'Equipement supprime' });
    }

    if (req.session) {
      req.session.flash = { success: 'Equipement supprime avec succes.' };
    }
    return res.redirect('/manager/equipments');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(err.status).json({ error: err.message });
      }
      if (req.session) {
        req.session.flash = { error: err.message };
      }
      return res.redirect('/manager/equipments');
    }
    next(err);
  }
};

module.exports = {
  listEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
