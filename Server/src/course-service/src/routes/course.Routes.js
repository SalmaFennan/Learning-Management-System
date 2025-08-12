import { Router } from 'express';
import {
  getAllCourse,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLectureToCourseById,
  removeLecture,
} from '../controllers/course.controllers.js';
import { isLoggedIn, authorizedRoles, authorizedSubscriber } from '../../auth-service/src/middlewares/auth.middleware.js'; // Ajusté
import upload from '../middlewares/multer.middleware.js';

const router = Router();

/**
 * @route GET /courses
 * @description Get all courses
 * @access Public
 */
router.route('/')
  .get(getAllCourse)
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
  );

/**
 * @route GET, PUT, DELETE /courses/:id
 * @description Get, update, or remove a course by ID
 * @access Admin only
 */
router.route('/:id')
  .get(
    isLoggedIn,
    // authorizedSubscriber,
    authorizedRoles('ADMIN'),
    getLecturesByCourseId
  )
  .put(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    updateCourse
  )
  .delete(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    removeCourse
  )
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('video'), // Corrige en 'video' pour les lectures
    addLectureToCourseById
  );

/**
 * @route DELETE /courses/:courseId/lectures/:lectureId
 * @description Remove a specific lecture from a course
 * @access Admin only
 */
router.route('/:courseId/lectures/:lectureId')
  .delete(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    removeLecture
  );

export default router;