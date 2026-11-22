const Equipment = require('../../models/equipment.model');
const Room = require('../../models/room.model');

const listEquipments = async (req, res, next) => {
  try {
    const equipments =await Equipment.find().sort({ name: 1 });
    const rooms=await Room.find({ space_type: 'room' }).select('name equipments');

    const usageMap = {};
    for (const eq of equipments) {
      const id=eq._id.toString();
      const usedIn= rooms.filter(
        (r) => r.equipments && r.equipments.some((e) => e.toString() === id)
      );
      usageMap[id]=usedIn.map((r) => r.name);
    }

    if (req.xhr ||req.headers.accept?.includes('application/json')) {
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
    const { name, icon, description } = req.body;
    const equipment = new Equipment({
      name: name.trim(),
      icon: (icon && icon.trim()) || 'bi-gear',
      description: (description && description.trim()) || '',
    });

    await equipment.save();

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(201).json({ message: 'Equipement cree', equipment });
    }

    if (req.session) {
      req.session.flash = { success: 'Equipement ajoute avec succes.' };
    }
    return res.redirect('/manager/equipments');
  } catch (err) {
    if (err.code === 11000) {
      const errorMsg = 'Un equipement avec ce nom existe deja.';
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ error: errorMsg });
      }
      if (req.session) {
        req.session.flash = { error: errorMsg };
      }
      return res.redirect('/manager/equipments');
    }
    next(err);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, description } = req.body;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      const errorMsg = 'Equipement introuvable.';
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ error: errorMsg });
      }
      if (req.session) {
        req.session.flash = { error: errorMsg };
      }
      return res.redirect('/manager/equipments');
    }

    await equipment.update_details(name, icon, description);

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ message: 'Equipement modifie', equipment });
    }

    if (req.session) {
      req.session.flash = { success: 'Equipement modifie avec succes.' };
    }
    return res.redirect('/manager/equipments');
  } catch (err) {
    if (err.code === 11000) {
      const errorMsg = 'Un equipement avec ce nom existe deja.';
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ error: errorMsg });
      }
      if (req.session) {
        req.session.flash = { error: errorMsg };
      }
      return res.redirect('/manager/equipments');
    }
    next(err);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Equipment.findByIdAndDelete(id);

    if (!deleted) {
      const errorMsg = 'Equipement introuvable.';
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ error: errorMsg });
      }
      if (req.session) {
        req.session.flash = { error: errorMsg };
      }
      return res.redirect('/manager/equipments');
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ message: 'Equipement supprime' });
    }

    if (req.session) {
      req.session.flash = { success: 'Equipement supprime avec succes.' };
    }
    return res.redirect('/manager/equipments');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
