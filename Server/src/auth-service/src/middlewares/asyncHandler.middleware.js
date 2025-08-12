// src/middlewares/asyncHandler.middleware.js

/**
 * Async Handler Middleware
 * Wraps async functions to catch errors and pass them to the next middleware
 * This eliminates the need to write try-catch blocks in every async controller
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;