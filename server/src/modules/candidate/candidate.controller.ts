// filename: server/src/modules/candidate/candidate.controller.ts
import type { Request, Response, NextFunction } from 'express';
import * as candidateService from './candidate.service';
import { ApiError } from '../../utils/ApiError';
import type { ListCandidateQuizzesQuery, SubmitAnswersInput } from './candidate.schema';

export async function getQuizzes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const query = req.query as unknown as ListCandidateQuizzesQuery;
    const data = await candidateService.listQuizzes(req.user.id, query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getQuizDetails(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const quiz = await candidateService.getQuizDetails(req.params.id, req.user.id);
    res.status(200).json({ quiz });
  } catch (err) {
    next(err);
  }
}

export async function startQuiz(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const data = await candidateService.startQuiz(req.params.id, req.user.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function submitQuiz(
  req: Request<{ id: string }, unknown, SubmitAnswersInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const attempt = await candidateService.submitQuiz(req.params.id, req.user.id, req.body.answers);
    res.status(200).json({ attempt, message: 'Quiz submitted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getQuizResult(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const result = await candidateService.getQuizResult(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
