// filename: server/src/modules/admin/admin.controller.ts
import type { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { ApiError } from '../../utils/ApiError';
import { toPublicUser } from '../../models/User';
import type { ListUsersQuery, CreateQuizInput, UpdateQuizInput, AssignInstructorInput, AnalyticsQuery } from './admin.schema';

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as ListUsersQuery;
    const data = await adminService.listUsers(query);
    const publicUsers = data.users.map((u) => toPublicUser(u));
    res.status(200).json({
      users: publicUsers,
      pagination: data.pagination,
      stats: data.stats,
    });
  } catch (err) {
    next(err);
  }
}

export async function createQuiz(
  req: Request<unknown, unknown, CreateQuizInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const quiz = await adminService.createQuiz(req.body, req.user.id);
    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
}

export async function updateQuiz(
  req: Request<{ id: string }, unknown, UpdateQuizInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quiz = await adminService.updateQuiz(req.params.id, req.body);
    res.status(200).json({ quiz });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuiz(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await adminService.deleteQuiz(req.params.id);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function cancelQuiz(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quiz = await adminService.cancelQuiz(req.params.id);
    res.status(200).json({ quiz, message: 'Quiz cancelled successfully' });
  } catch (err) {
    next(err);
  }
}

export async function assignInstructor(
  req: Request<{ id: string }, unknown, AssignInstructorInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quiz = await adminService.assignInstructor(req.params.id, req.body.email);
    res.status(200).json({ quiz, message: 'Instructor assigned successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as AnalyticsQuery;
    const stats = await adminService.getAnalytics(query);
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getQuizzes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const data = await adminService.listQuizzes({
      page,
      limit,
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function upgradeUserToInstructor(
  req: Request<unknown, unknown, { email: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await adminService.upgradeUserToInstructor(req.body.email);
    res.status(200).json({ user: toPublicUser(user), message: 'User upgraded to instructor successfully' });
  } catch (err) {
    next(err);
  }
}


