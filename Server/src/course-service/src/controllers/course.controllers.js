import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import Course from '../models/course.model.js';
import AppError from '../utils/error.util.js';

/**
 * @GET_ALL_COURSES
 * Fetches all courses excluding lectures.
 */
export const getAllCourse = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({}).select('-lectures');
  res.status(200).json({
    success: true,
    message: 'All courses',
    courses,
  });
});

/**
 * @GET_LECTURES_BY_COURSE_ID
 * Fetches lectures for a specific course.
 */
export const getLecturesByCourseId = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'Course lectures fetched successfully',
    lectures: course.lectures,
  });
});

/**
 * @CREATE_COURSE
 * Creates a new course and optionally uploads a thumbnail image.
 */
export const createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  if (!title || !description || !category || !createdBy) {
    return next(new AppError('All fields are required', 400));
  }
  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: 'Dummy',
      secure_url: 'Dummy',
    },
  });
  if (!course) {
    return next(new AppError('Course could not be created, please try again', 500));
  }
  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'lms' });
    if (result) {
      course.thumbnail.public_id = result.public_id;
      course.thumbnail.secure_url = result.secure_url;
    }
    await fs.rm(`uploads/${req.file.filename}`);
    await course.save();
  }
  res.status(200).json({
    success: true,
    message: 'Course created successfully',
    course,
  });
});

/**
 * @UPDATE_COURSE_BY_ID
 * Updates an existing course by ID.
 */
export const updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findByIdAndUpdate(
    id,
    { $set: req.body },
    { runValidators: true }
  );
  if (!course) {
    return next(new AppError('Course with given id does not exist', 404));
  }
  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
  });
});

/**
 * @DELETE_COURSE_BY_ID
 * Deletes a course by its ID.
 */
export const removeCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    return next(new AppError('Course with given id does not exist', 404));
  }
  await Course.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: 'Course removed successfully',
  });
});

/**
 * @ADD_LECTURE
 * Adds a lecture to a course and uploads video to Cloudinary.
 */
export const addLectureToCourseById = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const { id } = req.params;
  if (!title || !description) {
    return next(new AppError('All fields are required', 400));
  }
  const course = await Course.findById(id);
  if (!course) {
    return next(new AppError('Course does not exist', 404));
  }
  const lectureData = { title, description, lecture: {} };
  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'lms',
      chunk_size: 50000000,
      resource_type: 'video',
    });
    if (result) {
      lectureData.lecture.public_id = result.public_id;
      lectureData.lecture.secure_url = result.secure_url;
    }
    await fs.rm(`uploads/${req.file.filename}`);
    course.lectures.push(lectureData);
    course.numberOfLectures = course.lectures.length;
    await course.save();
  }
  res.status(200).json({
    success: true,
    message: 'Lecture added successfully',
    course,
  });
});

/**
 * @REMOVE_LECTURE
 * Removes a lecture from a course by its ID and deletes the video from Cloudinary.
 */
export const removeLecture = asyncHandler(async (req, res, next) => {
  const { courseId, lectureId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  const lectureIndex = course.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId
  );
  if (lectureIndex === -1) {
    return next(new AppError('Lecture not found', 404));
  }
  await cloudinary.v2.uploader.destroy(course.lectures[lectureIndex].lecture.public_id, {
    resource_type: 'video',
  });
  course.lectures.splice(lectureIndex, 1);
  course.numberOfLectures -= 1;
  await course.save();
  res.status(200).json({
    success: true,
    message: 'Lecture removed successfully',
  });
});