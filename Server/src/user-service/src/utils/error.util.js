/**
 * Error utility module
 * @module utils/error
 */

/**
 * Custom operational error class
 * @class AppError
 * @extends Error
 */
export class AppError extends Error {
  /**
   * Create an operational error
   * @param {string} message - Error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {string} [errorType='operational'] - Error type classification
   */
  constructor(message, statusCode = 500, errorType = 'operational') {
    super(message);
    
    // HTTP status code
    this.statusCode = statusCode;
    
    // Operational or programming error
    this.isOperational = true;
    this.errorType = errorType;
    
    // Capture stack trace (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);
    
    // Timestamp
    this.timestamp = new Date().toISOString();
    
    // Additional metadata
    this.metadata = {};
  }

  /**
   * Add metadata to error object
   * @param {Object} data - Additional error data
   * @returns {AppError}
   */
  withMetadata(data) {
    this.metadata = { ...this.metadata, ...data };
    return this;
  }
}

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Next middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Default values for non-AppError exceptions
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log detailed error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] ERROR:`, {
      message: err.message,
      stack: err.stack,
      metadata: err.metadata
    });
  }

  // Response structure
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errorType: err.errorType,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      metadata: err.metadata
    }),
    ...(err.isOperational && {
      timestamp: err.timestamp
    })
  });
};

/**
 * Async error handler wrapper
 * @param {Function} fn - Async controller function
 * @returns {Function} Wrapped middleware
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Export des utilitaires
export default {
  AppError,
  errorHandler,
  catchAsync
};