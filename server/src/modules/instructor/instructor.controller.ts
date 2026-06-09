// filename: server/src/modules/instructor/instructor.controller.ts
import type { Request, Response, NextFunction } from 'express';
import * as instructorService from './instructor.service';
import { ApiError } from '../../utils/ApiError';
import type { ListQuizzesQuery, QuestionInput, UpdateQuizInstructorInput, AddParticipantInput } from './instructor.schema';

export async function getQuizzes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const query = req.query as unknown as ListQuizzesQuery;
    const data = await instructorService.listQuizzes(req.user.id, query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function editQuiz(
  req: Request<{ id: string }, unknown, UpdateQuizInstructorInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const quiz = await instructorService.editQuiz(req.params.id, req.user.id, req.body);
    res.status(200).json({ quiz, message: 'Quiz details updated' });
  } catch (err) {
    next(err);
  }
}

export async function addQuestion(
  req: Request<{ id: string }, unknown, any>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }

    let quiz;
    // Support both single manual add and bulk import (array or object with questions key)
    if (Array.isArray(req.body)) {
      quiz = await instructorService.bulkAddQuestions(req.params.id, req.user.id, req.body);
      res.status(200).json({ quiz, message: 'Questions imported successfully' });
    } else if (req.body.questions && Array.isArray(req.body.questions)) {
      quiz = await instructorService.bulkAddQuestions(req.params.id, req.user.id, req.body.questions);
      res.status(200).json({ quiz, message: 'Questions imported successfully' });
    } else {
      quiz = await instructorService.addQuestion(req.params.id, req.user.id, req.body);
      res.status(201).json({ quiz, message: 'Question added successfully' });
    }
  } catch (err) {
    next(err);
  }
}

export async function editQuestion(
  req: Request<{ id: string; qId: string }, unknown, QuestionInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const quiz = await instructorService.editQuestion(req.params.id, req.user.id, req.params.qId, req.body);
    res.status(200).json({ quiz, message: 'Question updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuestion(
  req: Request<{ id: string; qId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const quiz = await instructorService.deleteQuestion(req.params.id, req.user.id, req.params.qId);
    res.status(200).json({ quiz, message: 'Question deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function addParticipant(
  req: Request<{ id: string }, unknown, any>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }

    let quiz;
    // Support single manual add by email or bulk emails array post
    if (Array.isArray(req.body.emails)) {
      for (const email of req.body.emails) {
        quiz = await instructorService.addParticipant(req.params.id, req.user.id, email);
      }
      res.status(200).json({ quiz, message: 'Participants imported successfully' });
    } else {
      const email = req.body.email;
      if (!email) {
        throw new ApiError(400, 'BAD_REQUEST', 'Email field is required');
      }
      quiz = await instructorService.addParticipant(req.params.id, req.user.id, email);
      res.status(200).json({ quiz, message: 'Participant added successfully' });
    }
  } catch (err) {
    next(err);
  }
}

export async function removeParticipant(
  req: Request<{ id: string; pId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const quiz = await instructorService.removeParticipant(req.params.id, req.user.id, req.params.pId);
    res.status(200).json({ quiz, message: 'Participant removed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function publishQuiz(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const quiz = await instructorService.publishQuiz(req.params.id, req.user.id);
    res.status(200).json({ quiz, message: 'Quiz published successfully' });
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
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const quiz = await instructorService.cancelQuiz(req.params.id, req.user.id);
    res.status(200).json({ quiz, message: 'Quiz cancelled successfully' });
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
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    await instructorService.deleteQuiz(req.params.id, req.user.id);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getQuizResults(
  req: Request<{ id: string }, unknown, unknown, { page?: string; limit?: string; search?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required');
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;

    const data = await instructorService.getQuizResults(req.params.id, req.user.id, req.user.role, {
      page,
      limit,
      ...(search ? { search } : {}),
    });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
