const mongoose = require('mongoose');

function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    db: mongoose.connection.readyState,
  });
}

module.exports = { getHealth };
