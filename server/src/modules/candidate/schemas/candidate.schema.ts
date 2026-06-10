// filename: server/src/modules/candidate/schemas/candidate.schema.ts
import { z } from 'zod';

export const listCandidateQuizzesQuerySchema = z.object({
  page: z.preprocess((val) => Number(val) || 1, z.number().min(1)).default(1),
  limit: z.preprocess((val) => Number(val) || 10, z.number().min(1).max(100)).default(10),
  filter: z.enum(['upcoming', 'live', 'completed', 'expired']).optional(),
  search: z.string().trim().optional(),
});
export type ListCandidateQuizzesQuery = z.infer<typeof listCandidateQuizzesQuerySchema>;

const answerItemSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionIds: z.array(z.string()),
});

export const submitAnswersSchema = z.object({
  answers: z.array(answerItemSchema),
});
export type SubmitAnswersInput = z.infer<typeof submitAnswersSchema>;
