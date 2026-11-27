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

module.exports = {
  register,
};
