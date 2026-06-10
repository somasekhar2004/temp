// filename: server/src/modules/instructor/routes/instructor.routes.ts
import { Router } from 'express';
import { validate } from '../../../middleware/validate';
import { requireAuth } from '../../../middleware/requireAuth';
import { requireRole } from '../../../middleware/requireRole';
import {
  listQuizzesQuerySchema,
  questionInputSchema,
  updateQuizInstructorSchema,
} from '../schemas/instructor.schema';
import * as ctrl from '../controllers/instructor.controller';

const router = Router();

// Allow both instructors and admins to fetch quiz results
router.get('/quizzes/:id/results', requireAuth, requireRole('instructor', 'admin'), ctrl.getQuizResults);

// Enforce auth and instructor/admin role for all other endpoints in this router
router.use(requireAuth, requireRole('instructor', 'admin'));

/**
 * @swagger
 * /api/instructor/quizzes:
 *   get:
 *     tags: [Instructor]
 *     summary: Get all quizzes assigned to the current instructor
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
 *         name: status
 *         schema: { type: string, enum: [Draft, Scheduled, Live, Completed, Cancelled] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of quizzes with readiness signals
 */
router.get('/quizzes', validate(listQuizzesQuerySchema, 'query'), ctrl.getQuizzes);

/**
 * @swagger
 * /api/instructor/quizzes/{id}:
 *   patch:
 *     tags: [Instructor]
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
 *       403:
 *         description: Forbidden - ownership check fails
 */
router.patch('/quizzes/:id', validate(updateQuizInstructorSchema, 'body'), ctrl.editQuiz);

/**
 * @swagger
 * /api/instructor/quizzes/{id}/questions:
 *   post:
 *     tags: [Instructor]
 *     summary: Add a question manually or import multiple questions in bulk
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
 *               text: { type: string }
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     text: { type: string }
 *               correctOptionIds:
 *                 type: array
 *                 items: { type: string }
 *               type: { type: string, enum: [single-choice, multi-select, true/false] }
 *     responses:
 *       201:
 *         description: Question(s) added successfully
 */
router.post('/quizzes/:id/questions', ctrl.addQuestion);

/**
 * @swagger
 * /api/instructor/quizzes/{id}/questions/{qId}:
 *   patch:
 *     tags: [Instructor]
 *     summary: Edit an existing question details (Draft state only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: qId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text: { type: string }
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     text: { type: string }
 *               correctOptionIds:
 *                 type: array
 *                 items: { type: string }
 *               type: { type: string, enum: [single-choice, multi-select, true/false] }
 *     responses:
 *       200:
 *         description: Question updated successfully
 */
router.patch('/quizzes/:id/questions/:qId', validate(questionInputSchema, 'body'), ctrl.editQuestion);

/**
 * @swagger
 * /api/instructor/quizzes/{id}/questions/{qId}:
 *   delete:
 *     tags: [Instructor]
 *     summary: Delete a question (Draft state only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: qId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Question deleted successfully
 */
router.delete('/quizzes/:id/questions/:qId', ctrl.deleteQuestion);

/**
 * @swagger
 * /api/instructor/quizzes/{id}/participants:
 *   post:
 *     tags: [Instructor]
 *     summary: Assign a candidate manually by email or import multiple candidates
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
 *               email: { type: string, format: email }
 *               emails:
 *                 type: array
 *                 items: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Participant(s) assigned successfully
 */
router.post('/quizzes/:id/participants', ctrl.addParticipant);

/**
 * @swagger
 * /api/instructor/quizzes/{id}/participants/{pId}:
 *   delete:
 *     tags: [Instructor]
 *     summary: Remove a participant from the quiz (before Live state only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: pId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Participant removed successfully
 */
router.delete('/quizzes/:id/participants/:pId', ctrl.removeParticipant);

/**
 * @swagger
 * /api/instructor/quizzes/{id}/publish:
 *   post:
 *     tags: [Instructor]
 *     summary: Publish a draft quiz to scheduled status
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Quiz scheduled successfully
 *       409:
 *         description: Publish failed due to failed checks (e.g. empty questions/roster)
 */
router.post('/quizzes/:id/publish', ctrl.publishQuiz);

/**
 * @swagger
 * /api/instructor/quizzes/{id}/cancel:
 *   post:
 *     tags: [Instructor]
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
 * /api/instructor/quizzes/{id}:
 *   delete:
 *     tags: [Instructor]
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
 */
router.delete('/quizzes/:id', ctrl.deleteQuiz);

export default router;
