// filename: server/src/middleware/requireRole.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import type { UserRole } from '../types/auth';

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'NOT_AUTHENTICATED', 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Access denied. Insufficient permissions.'));
    }
    next();
  };
}
