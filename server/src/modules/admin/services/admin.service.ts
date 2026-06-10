// filename: server/src/modules/admin/services/admin.service.ts
import { User, type UserDocument } from '../../../models/User';
import { Quiz, type QuizDocument } from '../../../models/Quiz';
import { QuizAttempt } from '../../../models/QuizAttempt';
import { ApiError } from '../../../utils/ApiError';
import type { ListUsersQuery, CreateQuizInput, UpdateQuizInput, AnalyticsQuery } from '../schemas/admin.schema';
import type { FilterQuery } from 'mongoose';
import type { IUser } from '../../../models/User';

export async function listUsers(query: ListUsersQuery) {
  const filter: FilterQuery<IUser> = {};

  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const skip = (query.page - 1) * query.limit;
  const sortObj: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  // Fetch users and global counts in parallel to avoid multiple single queries
  const [users, totalMatched, statsData] = await Promise.all([
    User.find(filter).sort(sortObj).skip(skip).limit(query.limit),
    User.countDocuments(filter),
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          adminCount: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          instructorCount: { $sum: { $cond: [{ $eq: ['$role', 'instructor'] }, 1, 0] } },
          candidateCount: { $sum: { $cond: [{ $eq: ['$role', 'participant'] }, 1, 0] } },
          activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactiveCount: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const stats = statsData[0] || {
    totalUsers: 0,
    adminCount: 0,
    instructorCount: 0,
    candidateCount: 0,
    activeCount: 0,
    inactiveCount: 0,
  };

  const pages = Math.ceil(totalMatched / query.limit);

  return {
    users,
    pagination: {
      total: totalMatched,
      page: query.page,
      limit: query.limit,
      pages,
    },
    stats,
  };
}

export async function createQuiz(input: CreateQuizInput): Promise<QuizDocument> {
  const quiz = await Quiz.create({
    title: input.title,
    description: input.description,
    duration: input.duration,
    startTime: new Date(input.startTime),
    endTime: new Date(input.endTime),
    status: 'Draft',
  });
  return quiz;
}

export async function updateQuiz(id: string, input: UpdateQuizInput): Promise<QuizDocument> {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
  }

  // Allow edits only while quiz is Draft or Scheduled
  if (!['Draft', 'Scheduled'].includes(quiz.status)) {
    throw new ApiError(400, 'EDIT_RESTRICTED', `Cannot edit quiz in ${quiz.status} state`);
  }

  if (input.title !== undefined) quiz.title = input.title;
  if (input.description !== undefined) quiz.description = input.description;
  if (input.duration !== undefined) quiz.duration = input.duration;
  if (input.startTime !== undefined) quiz.startTime = new Date(input.startTime);
  if (input.endTime !== undefined) quiz.endTime = new Date(input.endTime);

  // Validate start/end times if updated
  if (quiz.endTime <= quiz.startTime) {
    throw new ApiError(400, 'INVALID_TIMEFRAME', 'End time must be strictly after start time');
  }

  await quiz.save();
  return quiz;
}

export async function deleteQuiz(id: string): Promise<void> {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
  }

  // Only Draft quizzes can be deleted
  if (quiz.status !== 'Draft') {
    throw new ApiError(409, 'DELETE_RESTRICTED', `Only Draft quizzes can be deleted, status is ${quiz.status}`);
  }

  await Quiz.deleteOne({ _id: id });
}

export async function cancelQuiz(id: string): Promise<QuizDocument> {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
  }

  if (quiz.status === 'Completed') {
    throw new ApiError(400, 'CANCEL_RESTRICTED', 'Completed quizzes cannot be cancelled');
  }

  quiz.status = 'Cancelled';
  quiz.cancellationTimestamp = new Date();
  await quiz.save();
  return quiz;
}

export async function getAnalytics(query: AnalyticsQuery) {
  const quizFilter: FilterQuery<any> = {};
  if (query.instructorId) {
    quizFilter.instructor = query.instructorId;
  }
  if (query.startDate || query.endDate) {
    quizFilter.startTime = {};
    if (query.startDate) quizFilter.startTime.$gte = new Date(query.startDate);
    if (query.endDate) quizFilter.startTime.$lte = new Date(query.endDate);
  }

  const [quizzes, totalInstructors, totalCandidates] = await Promise.all([
    Quiz.find(quizFilter),
    User.countDocuments({ role: 'instructor' }),
    User.countDocuments({ role: 'participant' }),
  ]);

  const totalQuizzes = quizzes.length;
  let draftCount = 0;
  let scheduledCount = 0;
  let liveCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let totalAssignedParticipants = 0;

  quizzes.forEach((q) => {
    if (q.status === 'Draft') draftCount++;
    else if (q.status === 'Scheduled') scheduledCount++;
    else if (q.status === 'Live') liveCount++;
    else if (q.status === 'Completed') completedCount++;
    else if (q.status === 'Cancelled') cancelledCount++;

    totalAssignedParticipants += q.participants.length;
  });

  // Calculate average attempt rate across all quizzes
  const totalAttemptsCount = await QuizAttempt.countDocuments();
  const averageAttemptRate = totalAssignedParticipants > 0 
    ? Number((totalAttemptsCount / totalAssignedParticipants).toFixed(2)) 
    : 0;

  return {
    totalQuizzes,
    draftCount,
    scheduledCount,
    liveCount,
    completedCount,
    cancelledCount,
    totalParticipants: totalCandidates,
    totalInstructors,
    averageAttemptRate,
  };
}

export async function listQuizzes(query: { page: number; limit: number; status?: string; search?: string }) {
  const filter: FilterQuery<any> = {};
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

  const pages = Math.ceil(total / query.limit);

  return {
    quizzes,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      pages,
    },
  };
}

export async function upgradeUserToInstructor(email: string): Promise<UserDocument> {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Email not registered on the platform');
  }
  if (user.role === 'instructor') {
    throw new ApiError(400, 'ALREADY_INSTRUCTOR', 'User is already an instructor');
  }
  user.role = 'instructor';
  await user.save();
  return user;
}
