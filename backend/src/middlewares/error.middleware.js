function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = { notFound, errorHandler };
