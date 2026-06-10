// filename: server/src/modules/candidate/routes/candidate.routes.ts
import { Router } from 'express';
import { validate } from '../../../middleware/validate';
import { requireAuth } from '../../../middleware/requireAuth';
import { requireRole } from '../../../middleware/requireRole';
import { listCandidateQuizzesQuerySchema, submitAnswersSchema } from '../schemas/candidate.schema';
import * as ctrl from '../controllers/candidate.controller';

const router = Router();

// Enforce auth and participant (candidate) role for all endpoints in this router
router.use(requireAuth, requireRole('participant'));

/**
 * @swagger
 * /api/candidate/quizzes:
 *   get:
 *     tags: [Candidate]
 *     summary: Retrieve quizzes assigned to the logged-in candidate
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
 *         name: filter
 *         schema: { type: string, enum: [upcoming, live, completed, expired] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of assigned quizzes with category stats
 */
router.get('/quizzes', validate(listCandidateQuizzesQuerySchema, 'query'), ctrl.getQuizzes);

/**
 * @swagger
 * /api/candidate/quizzes/{id}:
 *   get:
 *     tags: [Candidate]
 *     summary: Get pre-test metadata only (no questions exposed)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Quiz details summary metadata
 */
router.get('/quizzes/:id', ctrl.getQuizDetails);

/**
 * @swagger
 * /api/candidate/quizzes/{id}/start:
 *   post:
 *     tags: [Candidate]
 *     summary: Start a quiz attempt and fetch questions (correct options stripped)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Test session initialized successfully
 *       403:
 *         description: Quiz not live or not assigned
 *       409:
 *         description: Quiz attempt already submitted
 */
router.post('/quizzes/:id/start', ctrl.startQuiz);

/**
 * @swagger
 * /api/candidate/quizzes/{id}/submit:
 *   post:
 *     tags: [Candidate]
 *     summary: Submit final answers for the quiz attempt
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
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [questionId, selectedOptionIds]
 *                   properties:
 *                     questionId: { type: string }
 *                     selectedOptionIds:
 *                       type: array
 *                       items: { type: string }
 *     responses:
 *       200:
 *         description: Attempt graded and finalized successfully
 */
router.post('/quizzes/:id/submit', validate(submitAnswersSchema, 'body'), ctrl.submitQuiz);

/**
 * @swagger
 * /api/candidate/quizzes/{id}/result:
 *   get:
 *     tags: [Candidate]
 *     summary: Get scorecard detail for candidate's own completed quiz attempt
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Quiz scorecard and question-by-question breakdown details
 *       404:
 *         description: Quiz attempt not submitted yet
 */
router.get('/quizzes/:id/result', ctrl.getQuizResult);

export default router;
