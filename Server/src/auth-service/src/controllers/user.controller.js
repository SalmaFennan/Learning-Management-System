// src/controllers/user.controller.js
import cloudinary from 'cloudinary';
import crypto from 'crypto';
import fs from 'fs/promises';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import AppError from '../utils/error.util.js';
import sendEmail from '../utils/sendEmail.js';

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Secure only in production
  sameSite: 'None',
};

/**
 * @REGISTER - Registers a new user
 */
export const register = asyncHandler(async (req, res, next) => {
  const { fullName, email, password } = req.body;
  
  if (!fullName || !email || !password) {
    return next(new AppError('All fields are required', 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('Email already exists', 409));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
    },
  });

  if (!user) {
    return next(new AppError('User registration failed, please try again', 400));
  }

  // Handle file upload if present
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill',
      });
      
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
        // Remove file from server
        await fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (e) {
      return next(new AppError(e.message || 'File not uploaded, please try again', 500));
    }
  }

  await user.save();
  const token = await user.generateJWTToken();
  user.password = undefined;
  
  res.cookie('token', token, cookieOptions);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user,
  });
});

/**
 * @LOGIN - Logs in an existing user
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  
  if (!(user && (await user.comparePassword(password)))) {
    return next(new AppError('Email or password does not match', 400));
  }

  const token = await user.generateJWTToken();
  user.password = undefined;

  res.cookie('token', token, cookieOptions);
  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    user,
  });
});

/**
 * @LOGOUT - Logs out the user
 */
export const logout = asyncHandler(async (req, res, next) => {
  // Clear the token cookie
  res.cookie('token', null, {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

/**
 * @GET_PROFILE - Fetches the logged-in user's profile
 */
export const getProfile = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User does not exist', 404));
    }

    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      user,
    });
  } catch (e) {
    return next(new AppError('Failed to fetch profile', 500));
  }
});

/**
 * @FORGOT_PASSWORD - Initiates password reset process
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Email not registered', 400));
  }

  // Generate reset token
  const resetToken = await user.generatePasswordResetToken();
  await user.save();

  // Create reset URL
  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Email subject and message
  const subject = 'Reset Password';
  const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

  try {
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully`,
    });
  } catch (e) {
    // If email sending fails, clear the reset token
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();
    return next(new AppError(e.message, 500));
  }
});

/**
 * @RESET_PASSWORD - Resets the password using the reset token
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Password is required', 400));
  }

  // Hash the reset token to compare with stored token
  const forgotPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired, please try again', 400));
  }

  // Update password and clear reset token fields
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully!',
  });
});

/**
 * @CHANGE_PASSWORD - Changes the logged-in user's password
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;

  if (!oldPassword || !newPassword) {
    return next(new AppError('All fields are mandatory', 400));
  }

  const user = await User.findById(id).select('+password');

  if (!user) {
    return next(new AppError('User does not exist', 400));
  }

  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    return next(new AppError('Invalid old password', 400));
  }

  user.password = newPassword;
  await user.save();

  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Password changed successfully!',
  });
});

/**
 * @UPDATE_USER - Updates the logged-in user's profile and avatar
 */
export const updateUser = asyncHandler(async (req, res, next) => {
  const { fullName } = req.body;
  const { id } = req.user;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User does not exist', 400));
  }

  if (fullName) {
    user.fullName = fullName;
  }

  // Handle avatar upload if present
  if (req.file) {
    try {
      // Delete old avatar from cloudinary if it exists and is not the default
      if (user.avatar.public_id && user.avatar.public_id !== user.email) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }

      // Upload new avatar
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill',
      });

      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // Remove file from server
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (e) {
      return next(new AppError(e.message || 'File not uploaded, please try again', 500));
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User details updated successfully!',
    user,
  });
});