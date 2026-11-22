const Client = require('../../models/client.model');

async function register(req, res, next) {
  try {
    const { first_name, last_name, email, password, phone } = req.body;
    
    const client = await Client.register(first_name, last_name, email, password, phone);

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
    const { email, password } = req.body;
    const { client, token } = await Client.login(email, password);

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
    return res.status(200).json({
      client: req.client,
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
