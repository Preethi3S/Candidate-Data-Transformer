function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  return res.status(status).json({
    error: status === 500 ? "Internal server error" : error.message,
    details: process.env.NODE_ENV === "production" ? undefined : error.message
  });
}

module.exports = { errorHandler };
