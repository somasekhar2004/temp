// filename: server/src/modules/admin/schemas/admin.schema.ts
import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).default(1),
  limit: z.preprocess((val) => Number(val) || 10, z.number().min(1).max(100)).default(10),
  role: z.enum(['admin', 'instructor', 'participant']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const listQuizzesAdminQuerySchema = z.object({
  page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).default(1),
  limit: z.preprocess((val) => Number(val) || 10, z.number().min(1).max(100)).default(10),
  status: z.enum(['Draft', 'Scheduled', 'Live', 'Completed', 'Cancelled']).optional(),
  search: z.string().trim().optional(),
});
export type ListQuizzesAdminQuery = z.infer<typeof listQuizzesAdminQuerySchema>;

export const createQuizSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100, 'Title too long'),
  description: z.string().trim().min(1, 'Description is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  startTime: z.string().datetime({ message: 'Invalid start time format (ISO-8601 required)' }),
  endTime: z.string().datetime({ message: 'Invalid end time format (ISO-8601 required)' }),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be strictly after start time',
  path: ['endTime'],
});
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const updateQuizSchema = z.object({
  title: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(1).optional(),
  duration: z.number().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return new Date(data.endTime) > new Date(data.startTime);
  }
  return true;
}, {
  message: 'End time must be strictly after start time',
  path: ['endTime'],
});
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

export const assignInstructorSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});
export type AssignInstructorInput = z.infer<typeof assignInstructorSchema>;

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  instructorId: z.string().trim().optional(),
});
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
