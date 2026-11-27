const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/rooms'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + Math.round(Math.random() * 1000) + path.extname(file.originalname);
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const uploadRoomPhotos = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).array('photos', 5);

module.exports = { uploadRoomPhotos };
