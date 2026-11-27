const { CreateRoomDto, UpdateRoomDto } = require('../../dtos/room.dto');
const roomService = require('../../services/room.service');
const equipmentService = require('../../services/equipment.service');

function wantsJson(req) {
  return req.accepts(['html', 'json']) === 'json';
}

function handleError(req, res, next, err, url) {
  if (!err.status) return next(err);
  if (wantsJson(req)) return res.status(err.status).json({ error: err.message });
  if (req.session) req.session.flash = { error: err.message };
  res.redirect(url);
}

async function listRooms(req, res) {
  const rooms = await roomService.listRooms();
  if (wantsJson(req)) return res.json({ rooms });
  res.render('manager/rooms/index', { rooms, pageTitle: 'Salles' });
}

async function showNewRoom(req, res) {
  const data = await equipmentService.listEquipmentsWithUsage();
  res.render('manager/rooms/new', { equipments: data.equipments, pageTitle: 'Nouvelle salle' });
}

async function createRoom(req, res, next) {
  try {
    const dto = new CreateRoomDto(req.body, req.files);
    const room = await roomService.createRoom(dto);
    if (wantsJson(req)) return res.status(201).json({ room });
    if (req.session) req.session.flash = { success: 'Salle creee avec succes.' };
    res.redirect('/manager/rooms');
  } catch (err) {
    handleError(req, res, next, err, '/manager/rooms/new');
  }
}

async function showEditRoom(req, res, next) {
  try {
    const room = await roomService.getRoom(req.params.id);
    const data = await equipmentService.listEquipmentsWithUsage();
    const selected = [];
    for (const eq of room.equipments) {
      selected.push(String(eq._id || eq));
    }
    res.render('manager/rooms/edit', { room, selected, equipments: data.equipments, pageTitle: 'Modifier la salle' });
  } catch (err) {
    handleError(req, res, next, err, '/manager/rooms');
  }
}

async function updateRoom(req, res, next) {
  try {
    const dto = new UpdateRoomDto(req.body, req.files);
    const room = await roomService.updateRoom(req.params.id, dto);
    if (wantsJson(req)) return res.json({ room });
    if (req.session) req.session.flash = { success: 'Salle modifiee avec succes.' };
    res.redirect('/manager/rooms');
  } catch (err) {
    handleError(req, res, next, err, '/manager/rooms/' + req.params.id + '/edit');
  }
}

async function deleteRoom(req, res, next) {
  try {
    await roomService.deleteRoom(req.params.id);
    if (wantsJson(req)) return res.json({ message: 'Salle supprimee' });
    if (req.session) req.session.flash = { success: 'Salle supprimee avec succes.' };
    res.redirect('/manager/rooms');
  } catch (err) {
    handleError(req, res, next, err, '/manager/rooms');
  }
}

module.exports = {
  listRooms,
  showNewRoom,
  createRoom,
  showEditRoom,
  updateRoom,
  deleteRoom,
};
