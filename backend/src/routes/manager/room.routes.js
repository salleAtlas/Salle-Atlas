const router = require('express').Router();
const { uploadRoomPhotos } = require('../../config/multer.config');
const { validateRoomId, validateRoom } = require('../../middlewares/validators/room.validator');
const {
  listRooms,
  showNewRoom,
  createRoom,
  showEditRoom,
  updateRoom,
  deleteRoom,
} = require('../../controllers/manager/managerRoom.controller');

router.get('/', listRooms);
router.get('/new', showNewRoom);
router.post('/', uploadRoomPhotos, validateRoom, createRoom);
router.get('/:id/edit', validateRoomId, showEditRoom);
router.put('/:id', validateRoomId, uploadRoomPhotos, validateRoom, updateRoom);
router.delete('/:id', validateRoomId, deleteRoom);

module.exports = router;
