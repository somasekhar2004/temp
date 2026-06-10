// filename: server/src/modules/admin/routes/admin.routes.ts
import { Router } from 'express';
import { validate } from '../../../middleware/validate';
import { requireAuth } from '../../../middleware/requireAuth';
import { requireRole } from '../../../middleware/requireRole';
import {
  listUsersQuerySchema,
  listQuizzesAdminQuerySchema,
  createQuizSchema,
  updateQuizSchema,
  assignInstructorSchema,
  analyticsQuerySchema,
} from '../schemas/admin.schema';
import * as ctrl from '../controllers/admin.controller';

const router = Router();

// Enforce auth and admin-role checks for all routes in this router
router.use(requireAuth, requireRole('admin'));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Retrieve a paginated list of users with count statistics
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [admin, instructor, participant] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, email, createdAt], default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - admin access only
 */
router.get('/users', validate(listUsersQuerySchema, 'query'), ctrl.getUsers);

/**
 * @swagger
 * /api/admin/assign-instructor:
 *   post:
 *     tags: [Admin]
 *     summary: Upgrade user to instructor globally by email
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "candidate@example.com" }
 *     responses:
 *       200:
 *         description: User upgraded successfully
 */
router.post('/assign-instructor', validate(assignInstructorSchema, 'body'), ctrl.upgradeUserToInstructor);

router.get('/quizzes', validate(listQuizzesAdminQuerySchema, 'query'), ctrl.getQuizzes);

/**
 * @swagger
 * /api/admin/quizzes:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new draft quiz
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, duration, startTime, endTime]
 *             properties:
 *               title: { type: string, example: "React Fundamentals" }
 *               description: { type: string, example: "Test your React knowledge" }
 *               duration: { type: integer, example: 30 }
 *               startTime: { type: string, format: date-time, example: "2026-06-20T10:00:00Z" }
 *               endTime: { type: string, format: date-time, example: "2026-06-20T10:30:00Z" }
 *     responses:
 *       201:
 *         description: Quiz created successfully
 */
router.post('/quizzes', validate(createQuizSchema, 'body'), ctrl.createQuiz);

/**
 * @swagger
 * /api/admin/quizzes/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update quiz details (Draft or Scheduled status only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               duration: { type: integer }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       400:
 *         description: Invalid status constraint or dates
 */
router.patch('/quizzes/:id', validate(updateQuizSchema, 'body'), ctrl.updateQuiz);

/**
 * @swagger
 * /api/admin/quizzes/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a draft quiz
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       409:
 *         description: Delete restricted for non-draft quizzes
 */
router.delete('/quizzes/:id', ctrl.deleteQuiz);

/**
 * @swagger
 * /api/admin/quizzes/{id}/cancel:
 *   post:
 *     tags: [Admin]
 *     summary: Cancel a scheduled or live quiz
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Quiz cancelled successfully
 */
router.post('/quizzes/:id/cancel', ctrl.cancelQuiz);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get cross-quiz analytics metrics
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: instructorId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Analytics summary details
 */
router.get('/analytics', validate(analyticsQuerySchema, 'query'), ctrl.getAnalytics);

export default router;



