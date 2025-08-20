import asyncHandler from '../middlewares/asyncHandler.middleware.js'; // Assuming you have this
import AppError from '../utils/error.util.js'; // Assuming you have this
import UserProfile from '../models/UserProfile.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

// Create or update user profile
export const createOrUpdateProfile = asyncHandler(async (req, res, next) => {
  const { username, email, bio, avatar } = req.body;
  const userId = req.user.id; // From auth middleware

  let profile = await UserProfile.findOne({ userId });

  if (profile) {
    profile.username = username || profile.username;
    profile.email = email || profile.email;
    profile.bio = bio || profile.bio;
    profile.updatedAt = Date.now();
  } else {
    profile = new UserProfile({
      userId,
      username,
      email,
      bio,
    });
  }

  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'lms/profiles',
      width: 250,
      height: 250,
      gravity: 'faces',
      crop: 'fill',
    });
    profile.avatar = result.secure_url;
    await fs.rm(req.file.path);
  }

  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Profile created/updated successfully',
    profile,
  });
});

// Get user profile
export const getProfile = asyncHandler(async (req, res, next) => {
  const userId = req.params.id || req.user.id;

  const profile = await UserProfile.findOne({ userId });

  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }

  res.status(200).json({
    success: true,
    profile,
  });
});

// Delete user profile
export const deleteProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const profile = await UserProfile.findOneAndDelete({ userId });

  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Profile deleted successfully',
  });
});