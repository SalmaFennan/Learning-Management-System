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
import { isLoggedIn, authorizedRoles, authorizedSubscriber } from '../middlewares/auth.js'; // Corrigé
import upload from '../middlewares/multer.middleware.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';

const router = Router();

router.route('/')
  .get(asyncHandler(getAllCourse))
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    asyncHandler(createCourse)
  );

router.route('/:id')
  .get(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    asyncHandler(getLecturesByCourseId)
  )
  .put(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    asyncHandler(updateCourse)
  )
  .delete(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    asyncHandler(removeCourse)
  )
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('video'),
    asyncHandler(addLectureToCourseById)
  );

router.route('/:courseId/lectures/:lectureId')
  .delete(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    asyncHandler(removeLecture)
  );

export default router;