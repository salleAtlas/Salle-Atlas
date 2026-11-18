const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env.config');
const { getHealth } = require('./controllers/api/health.controller');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(morgan('dev'));

// GUARDRAIL (D1): Mount POST /api/payments/webhook with express.raw({ type: 'application/json' })
// strictly BEFORE app.use(express.json()).

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', getHealth);

// Feature routers mounted by subsequent PRs:
// app.use('/api', apiRoutes);
// app.use('/manager', managerRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
