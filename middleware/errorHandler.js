const ApiError = require('../utils/ApiError');

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

// Centralized error handler - converts known error types into a
// consistent JSON shape: { success: false, message, details? }
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }

  // Mongoose duplicate key errors (e.g. unique registrationNumber/licenseNumber/email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `Duplicate value for field '${field}'` : 'Duplicate value';
  }

  // Mongoose invalid ObjectId cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
  }

  if (!(err instanceof ApiError) && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};

module.exports = { notFound, errorHandler };
