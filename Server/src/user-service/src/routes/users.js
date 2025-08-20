import express from 'express';
import {
  createOrUpdateProfile,
  getProfile,
  deleteProfile,
} from '../controllers/user.controller.js';
import { validateToken } from '../middlewares/validateToken.js'; // Assuming this is for auth

const router = express.Router();

/**
 * @route PUT /users/profile
 * @description Create or update user profile
 * @access Private
 */
router.put('/profile', validateToken, createOrUpdateProfile);

/**
 * @route GET /users/profile/:id
 * @description Get user profile
 * @access Private
 */
router.get('/profile/:id', validateToken, getProfile);

/**
 * @route DELETE /users/profile
 * @description Delete user profile
 * @access Private
 */
router.delete('/profile', validateToken, deleteProfile);

export default router;