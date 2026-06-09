// filename: server/src/modules/instructor/instructor.schema.ts
import { z } from 'zod';

export const listQuizzesQuerySchema = z.object({
  page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).default(1),
  limit: z.preprocess((val) => Number(val) || 10, z.number().min(1).max(100)).default(10),
  status: z.enum(['Draft', 'Scheduled', 'Live', 'Completed', 'Cancelled']).optional(),
  search: z.string().trim().optional(),
  instructorId: z.string().trim().optional(),
});
export type ListQuizzesQuery = z.infer<typeof listQuizzesQuerySchema>;

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1, 'Option text cannot be empty'),
});

export const questionInputSchema = z.object({
  text: z.string().trim().min(1, 'Question text is required'),
  options: z.array(optionSchema).min(2, 'At least 2 options are required').max(6),
  correctOptionIds: z.array(z.string()).min(1, 'At least one correct option must be selected'),
  type: z.enum(['single-choice', 'multi-select', 'true/false']),
}).refine((data) => {
  // Ensure correctOptionIds correspond to options provided
  const optionIds = new Set(data.options.map((o) => o.id));
  const valid = data.correctOptionIds.every((id) => optionIds.has(id));
  return valid;
}, {
  message: 'Correct option IDs must match option IDs provided',
  path: ['correctOptionIds'],
});
export type QuestionInput = z.infer<typeof questionInputSchema>;

export const bulkQuestionsSchema = z.object({
  questions: z.array(questionInputSchema).min(1, 'At least one question is required for bulk insert'),
});
export type BulkQuestionsInput = z.infer<typeof bulkQuestionsSchema>;

export const addParticipantSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;

export const bulkParticipantsSchema = z.object({
  emails: z.array(z.string().trim().toLowerCase().email()).min(1, 'At least one participant email is required'),
});
export type BulkParticipantsInput = z.infer<typeof bulkParticipantsSchema>;

export const updateQuizInstructorSchema = z.object({
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
export type UpdateQuizInstructorInput = z.infer<typeof updateQuizInstructorSchema>;
