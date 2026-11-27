const router = require('express').Router();
const { renderLogin, login, logout } = require('../../controllers/manager/managerAuth.controller');

router.get('/login', renderLogin);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
