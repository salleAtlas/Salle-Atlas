const session = require('express-session');
const connectMongo = require('connect-mongo');
const env = require('./env.config');

const MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;

const SESSION_MAX_AGE_MS = 30 * 60 * 1000;

const sessionOptions = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_MS,
  },
};

if (env.NODE_ENV !== 'test') {
  sessionOptions.store = MongoStore.create({
    mongoUrl: env.MONGODB_URI,
    ttl: 30 * 60,
  });
}

const sessionMiddleware = session(sessionOptions);

module.exports = {
  sessionMiddleware,
  sessionOptions,
  SESSION_MAX_AGE_MS,
};
