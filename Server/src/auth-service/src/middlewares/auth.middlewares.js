// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/error.util.js';

export const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError('Unauthenticated, please login again', 401));
  }

  try {
    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
  } catch (err) {
    return next(new AppError('Invalid token, please login again', 401));
  }
};

/**
 * @authorizedRoles - Middleware to check if the user has authorized roles
 */
export const authorizedRoles = (...roles) => async (req, res, next) => {
  const currentUserRole = req.user.role;
  if (!roles.includes(currentUserRole)) {
    return next(new AppError('You do not have permission to access this route', 403));
  }
  next();
};

/**
 * @authorizedSubscriber - Middleware to check if the user has an active subscription
 */
export const authorizedSubscriber = async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user || (user.role !== 'ADMIN' && user.subscription?.status !== 'active')) {
    return next(new AppError('Please subscribe to access this', 403));
  }
  next();
};