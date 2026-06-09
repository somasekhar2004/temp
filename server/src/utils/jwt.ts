import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { jwtPayloadSchema, type JwtPayload, type UserRole } from '../types/auth';
import { ApiError } from './ApiError';

interface SignArgs {
  userId: string;
  role: UserRole;
}

export function signToken({ userId, role }: SignArgs): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  let decoded: unknown;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'TOKEN_INVALID', 'Authentication token is invalid or expired');
  }
  const result = jwtPayloadSchema.safeParse(decoded);
  if (!result.success) {
    throw new ApiError(401, 'TOKEN_MALFORMED', 'Authentication token payload is malformed');
  }
  return result.data;
}
