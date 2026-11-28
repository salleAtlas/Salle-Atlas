const { RegisterClientDto, LoginClientDto } = require('../../dtos/auth.dto');
const authService = require('../../services/auth.service');

async function register(req, res, next) {
  try {
    const dto = new RegisterClientDto(req.body);
    const client = await authService.registerClient(dto);

    return res.status(201).json({
      message: 'Client registered successfully',
      client,
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const dto = new LoginClientDto(req.body);
    const { client, token } = await authService.loginClient(dto);

    return res.status(200).json({
      message: 'Login successful',
      token,
      client,
    });
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const client = await authService.getMeById(req.user.id);
    return res.status(200).json({
      client,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
