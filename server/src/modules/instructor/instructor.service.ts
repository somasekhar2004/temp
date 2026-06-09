// filename: server/src/modules/instructor/instructor.service.ts
import { Quiz, type QuizDocument } from '../../models/Quiz';
import { User } from '../../models/User';
import { QuizAttempt } from '../../models/QuizAttempt';
import { ApiError } from '../../utils/ApiError';
import type { ListQuizzesQuery, QuestionInput, UpdateQuizInstructorInput } from './instructor.schema';
import { Types, type FilterQuery } from 'mongoose';
import type { IQuiz } from '../../models/Quiz';

// Helper to check quiz ownership and return the document
async function checkOwnership(quizId: string, instructorId: string): Promise<QuizDocument> {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
  }
  const user = await User.findById(instructorId);
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    throw new ApiError(403, 'FORBIDDEN', 'Access denied. You must be an instructor or admin.');
  }
  return quiz;
}

export async function listQuizzes(instructorId: string, query: ListQuizzesQuery) {
  const user = await User.findById(instructorId);
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    throw new ApiError(403, 'FORBIDDEN', 'Access denied. You must be an instructor or admin.');
  }
  const filter: FilterQuery<IQuiz> = {};

  if (query.instructorId) {
    filter.instructor = new Types.ObjectId(query.instructorId);
  }

  if (query.status) {
    filter.status = query.status;
  }
  if (query.search) {
    filter.$or = [
      { title: new RegExp(query.search, 'i') },
      { description: new RegExp(query.search, 'i') },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter).sort({ startTime: -1 }).skip(skip).limit(query.limit).populate('instructor', 'name email'),
    Quiz.countDocuments(filter),
  ]);

  // Map quizzes to include readiness signals
  const quizzesWithReadiness = quizzes.map((q) => {
    const questionsCount = q.questions.length;
    const participantsCount = q.participants.length;
    const isReady = questionsCount >= 1 && participantsCount >= 1;
    return {
      ...q.toJSON(),
      questionsCount,
      participantsCount,
      isReady,
    };
  });

  const pages = Math.ceil(total / query.limit);

  return {
    quizzes: quizzesWithReadiness,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      pages,
    },
  };
}

export async function editQuiz(
  quizId: string,
  instructorId: string,
  input: UpdateQuizInstructorInput
): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  // Allow edits only while quiz is Draft or Scheduled
  if (!['Draft', 'Scheduled'].includes(quiz.status)) {
    throw new ApiError(400, 'EDIT_RESTRICTED', `Cannot edit quiz in ${quiz.status} state`);
  }

  if (input.title !== undefined) quiz.title = input.title;
  if (input.description !== undefined) quiz.description = input.description;
  if (input.duration !== undefined) quiz.duration = input.duration;
  if (input.startTime !== undefined) quiz.startTime = new Date(input.startTime);
  if (input.endTime !== undefined) quiz.endTime = new Date(input.endTime);

  if (quiz.endTime <= quiz.startTime) {
    throw new ApiError(400, 'INVALID_TIMEFRAME', 'End time must be strictly after start time');
  }

  await quiz.save();
  return quiz;
}

export async function addQuestion(
  quizId: string,
  instructorId: string,
  input: QuestionInput
): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  if (quiz.status !== 'Draft') {
    throw new ApiError(400, 'STATE_LOCK', 'Questions can only be added to quizzes in Draft state');
  }

  // Generate unique subdocument _id
  quiz.questions.push({
    text: input.text,
    options: input.options,
    correctOptionIds: input.correctOptionIds,
    type: input.type,
  });

  await quiz.save();
  return quiz;
}

export async function bulkAddQuestions(
  quizId: string,
  instructorId: string,
  questions: QuestionInput[]
): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  if (quiz.status !== 'Draft') {
    throw new ApiError(400, 'STATE_LOCK', 'Questions can only be added to quizzes in Draft state');
  }

  // Append atomic validation and insertion
  questions.forEach((q) => {
    quiz.questions.push({
      text: q.text,
      options: q.options,
      correctOptionIds: q.correctOptionIds,
      type: q.type,
    });
  });

  await quiz.save();
  return quiz;
}

export async function editQuestion(
  quizId: string,
  instructorId: string,
  questionId: string,
  input: QuestionInput
): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  if (quiz.status !== 'Draft') {
    throw new ApiError(400, 'STATE_LOCK', 'Questions can only be edited in Draft state');
  }

  const q = quiz.questions.find((item: any) => item._id.toString() === questionId);
  if (!q) {
    throw new ApiError(404, 'QUESTION_NOT_FOUND', 'Question not found');
  }

  q.text = input.text;
  q.options = input.options;
  q.correctOptionIds = input.correctOptionIds;
  q.type = input.type;

  await quiz.save();
  return quiz;
}

export async function deleteQuestion(
  quizId: string,
  instructorId: string,
  questionId: string
): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  if (quiz.status !== 'Draft') {
    throw new ApiError(400, 'STATE_LOCK', 'Questions can only be deleted in Draft state');
  }

  const index = quiz.questions.findIndex((item: any) => item._id.toString() === questionId);
  if (index === -1) {
    throw new ApiError(404, 'QUESTION_NOT_FOUND', 'Question not found');
  }

  quiz.questions.splice(index, 1);
  await quiz.save();
  return quiz;
}

export async function addParticipant(
  quizId: string,
  instructorId: string,
  email: string
): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  // Enforce: participant management allowed only in Draft or Scheduled state
  if (!['Draft', 'Scheduled'].includes(quiz.status)) {
    throw new ApiError(400, 'STATE_LOCK', 'Participants can only be managed before quiz goes Live');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User email not found on the platform');
  }

  if (user.role !== 'participant') {
    throw new ApiError(400, 'ROLE_INVALID', 'Target user is not a participant candidate');
  }

  // Avoid duplicates
  const alreadyAssigned = quiz.participants.some((p) => p.userId.toString() === user._id.toString());
  if (alreadyAssigned) {
    return quiz; // Idempotent
  }

  quiz.participants.push({
    userId: user._id,
    addedAt: new Date(),
  });

  await quiz.save();
  return quiz;
}

export async function removeParticipant(
  quizId: string,
  instructorId: string,
  userIdString: string
): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  if (!['Draft', 'Scheduled'].includes(quiz.status)) {
    throw new ApiError(400, 'STATE_LOCK', 'Participants can only be managed before quiz goes Live');
  }

  const index = quiz.participants.findIndex((p) => p.userId.toString() === userIdString);
  if (index === -1) {
    throw new ApiError(404, 'PARTICIPANT_NOT_FOUND', 'Participant is not assigned to this quiz');
  }

  quiz.participants.splice(index, 1);
  await quiz.save();
  return quiz;
}

export async function publishQuiz(quizId: string, instructorId: string): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  if (quiz.status !== 'Draft') {
    throw new ApiError(400, 'PUBLISH_RESTRICTED', 'Only Draft quizzes can be published');
  }

  const missingReadiness: string[] = [];
  if (quiz.questions.length === 0) {
    missingReadiness.push('At least one question is required.');
  }
  if (quiz.participants.length === 0) {
    missingReadiness.push('At least one participant is required.');
  }
  if (quiz.startTime <= new Date()) {
    missingReadiness.push('Schedule window start time must be in the future.');
  }

  if (missingReadiness.length > 0) {
    throw new ApiError(409, 'PUBLISH_FAILED', 'Quiz fails readiness checklist', { errors: missingReadiness });
  }

  quiz.status = 'Scheduled';
  await quiz.save();
  return quiz;
}

export async function cancelQuiz(quizId: string, instructorId: string): Promise<QuizDocument> {
  const quiz = await checkOwnership(quizId, instructorId);

  if (quiz.status === 'Completed') {
    throw new ApiError(400, 'CANCEL_RESTRICTED', 'Completed quizzes cannot be cancelled');
  }

  quiz.status = 'Cancelled';
  quiz.cancellationTimestamp = new Date();
  await quiz.save();
  return quiz;
}

export async function deleteQuiz(quizId: string, instructorId: string): Promise<void> {
  const quiz = await checkOwnership(quizId, instructorId);

  if (quiz.status !== 'Draft') {
    throw new ApiError(409, 'DELETE_RESTRICTED', 'Only Draft quizzes can be deleted by the instructor');
  }

  await Quiz.deleteOne({ _id: quizId });
}

export async function getQuizResults(
  quizId: string,
  instructorId: string,
  userRole: string,
  query: { page: number; limit: number; search?: string }
) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
  }
  const user = await User.findById(instructorId);
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    throw new ApiError(403, 'FORBIDDEN', 'Access denied. You must be an instructor or admin.');
  }


  // Fetch all attempts for this quiz
  const attempts = await QuizAttempt.find({ quizId }).populate({
    path: 'candidateId',
    select: 'name email role status',
  });

  let filteredAttempts = attempts.filter((a) => a.candidateId !== null);

  // Leaderboard sorting: Rank by score (descending), break ties by time taken (ascending)
  filteredAttempts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const durationA = (a.submittedAt ? new Date(a.submittedAt).getTime() : 0) - (a.startedAt ? new Date(a.startedAt).getTime() : 0);
    const durationB = (b.submittedAt ? new Date(b.submittedAt).getTime() : 0) - (b.startedAt ? new Date(b.startedAt).getTime() : 0);
    return durationA - durationB;
  });

  if (query.search) {
    const searchStr = query.search.toLowerCase();
    filteredAttempts = filteredAttempts.filter((a) => {
      const user = a.candidateId as any;
      return user.name.toLowerCase().includes(searchStr) || user.email.toLowerCase().includes(searchStr);
    });
  }

  // Calculate statistics
  const totalSubmitted = attempts.length;
  const totalParticipants = quiz.participants.length;

  let totalScore = 0;
  let highestScore = 0;
  let lowestScore = totalSubmitted > 0 ? 100 : 0;

  // Score brackets mapping: >90% (excellent), 80-90%, 60-80%, 50-60%, <50% (fail)
  const distribution = {
    excelCount: 0, // >90%
    highCount: 0,  // 80-90%
    midCount: 0,   // 60-80%
    lowCount: 0,   // 50-60%
    failCount: 0,  // <50%
  };

  attempts.forEach((a) => {
    // Calculate percentage score relative to total questions count
    const totalQuestions = quiz.questions.length;
    const scorePct = totalQuestions > 0 ? (a.score / totalQuestions) * 100 : 0;

    totalScore += a.score;
    if (a.score > highestScore) highestScore = a.score;
    if (a.score < lowestScore) lowestScore = a.score;

    if (scorePct >= 90) distribution.excelCount++;
    else if (scorePct >= 80) distribution.highCount++;
    else if (scorePct >= 60) distribution.midCount++;
    else if (scorePct >= 50) distribution.lowCount++;
    else distribution.failCount++;
  });

  const averageScore = totalSubmitted > 0 ? Number((totalScore / totalSubmitted).toFixed(1)) : 0;

  // Pagination logic
  const skip = (query.page - 1) * query.limit;
  const paginatedAttempts = filteredAttempts.slice(skip, skip + query.limit);
  const pages = Math.ceil(filteredAttempts.length / query.limit);

  return {
    attempts: paginatedAttempts,
    pagination: {
      total: filteredAttempts.length,
      page: query.page,
      limit: query.limit,
      pages,
    },
    stats: {
      totalParticipants,
      totalSubmitted,
      averageScore,
      highestScore,
      lowestScore: totalSubmitted > 0 ? lowestScore : 0,
      distribution,
    },
  };
}
