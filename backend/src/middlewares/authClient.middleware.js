const jwt = require('jsonwebtoken');
const Client = require('../models/client.model');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_client_jwt_secret';

async function authClient(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Invalid token format.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const client = await Client.findById(decoded.id).select('-password_hash -reset_token -reset_token_expires');
    if (!client) {
      return res.status(401).json({ error: 'Client account no longer exists' });
    }

    req.client = client;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authClient };
