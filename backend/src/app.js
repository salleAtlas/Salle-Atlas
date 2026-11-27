const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const env = require('./config/env.config');
const { sessionMiddleware } = require('./config/session.config');
const { getHealth } = require('./controllers/api/health.controller');
const managerRoutes = require('./routes/manager/index.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/manager-layout');

// CSP disabled for EJS back-office inline event handlers & CDN assets (Bootstrap Icons, FullCalendar, Chart.js)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// GUARDRAIL (D1): Mount POST /api/payments/webhook with express.raw({ type: 'application/json' })
// strictly BEFORE app.use(express.json()).

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));
app.use(
  methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

app.use(sessionMiddleware);
app.use((req, res, next) => {
  res.locals.flash = (req.session && req.session.flash) || {};
  if (req.session) {
    delete req.session.flash;
  }
  res.locals.isManager = Boolean(req.session && req.session.isManager);
  res.locals.managerEmail = (req.session && req.session.managerEmail) || '';
  res.locals.currentPath = req.path;
  res.locals.pageTitle = 'Espace Manager';
  next();
});

app.get('/api/health', getHealth);

// Feature routers mounted by subsequent PRs:
const apiRoutes = require('./routes/api/index.routes');
app.use('/api', apiRoutes);
// Client API routers mounted by subsequent PRs:
// app.use('/api', apiRoutes);

app.use('/manager', managerRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
