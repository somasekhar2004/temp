// filename: server/src/modules/candidate/services/candidate.service.ts
import { Quiz, type QuizDocument } from '../../../models/Quiz';
import { QuizAttempt, type QuizAttemptDocument, type ICandidateAnswer } from '../../../models/QuizAttempt';
import { ApiError } from '../../../utils/ApiError';
import type { ListCandidateQuizzesQuery } from '../schemas/candidate.schema';
import { Types } from 'mongoose';

// Helper to determine real-time status of a quiz
export function getRealtimeStatus(q: QuizDocument, now: Date): 'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' {
  if (q.status === 'Cancelled' || q.status === 'Draft') return q.status;
  if (now < q.startTime) return 'Scheduled';
  if (now >= q.startTime && now <= q.endTime) return 'Live';
  return 'Completed';
}

export async function listQuizzes(candidateId: string, query: ListCandidateQuizzesQuery) {
  const now = new Date();

  // Find all quizzes that candidate is assigned to
  const quizzes = await Quiz.find({
    'participants.userId': new Types.ObjectId(candidateId),
  }).sort({ startTime: 1 });

  // Fetch all attempts for this candidate
  const attempts = await QuizAttempt.find({ candidateId: new Types.ObjectId(candidateId) });
  const attemptMap = new Map<string, typeof attempts[number]>();
  attempts.forEach((a) => {
    attemptMap.set(a.quizId.toString(), a);
  });

  // Filter and compute stats
  let totalAssigned = 0;
  let participatedCount = 0;
  let scheduledCount = 0;
  let liveCount = 0;

  const processedQuizzes = quizzes.map((q) => {
    const rStatus = getRealtimeStatus(q, now);
    const attempt = attemptMap.get(q._id.toString());
    const isAttempted = attempt && ['submitted', 'auto-submitted'].includes(attempt.status);

    // Increment stats for active/non-cancelled quizzes
    if (q.status !== 'Cancelled') {
      totalAssigned++;
      if (isAttempted) {
        participatedCount++;
      } else if (rStatus === 'Live') {
        liveCount++;
      } else if (rStatus === 'Scheduled') {
        scheduledCount++;
      }
    }

    // Determine final status from candidate's perspective
    let candidateStatus: 'upcoming' | 'live' | 'completed' | 'expired' = 'upcoming';
    if (isAttempted) {
      candidateStatus = 'completed';
    } else if (rStatus === 'Live') {
      candidateStatus = 'live';
    } else if (rStatus === 'Scheduled') {
      candidateStatus = 'upcoming';
    } else {
      candidateStatus = 'expired';
    }

    return {
      id: q._id.toString(),
      title: q.title,
      description: q.description,
      duration: q.duration,
      startTime: q.startTime,
      endTime: q.endTime,
      realStatus: rStatus,
      candidateStatus,
      questionCount: q.questions.length,
      attemptStatus: attempt?.status || null,
    };
  });

  // Apply filter
  let filtered = processedQuizzes;
  if (query.filter) {
    filtered = processedQuizzes.filter((q) => q.candidateStatus === query.filter);
  }

  // Apply search
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filtered = filtered.filter((q) => searchRegex.test(q.title) || searchRegex.test(q.description));
  }

  // Apply pagination
  const skip = (query.page - 1) * query.limit;
  const paginated = filtered.slice(skip, skip + query.limit);
  const pages = Math.ceil(filtered.length / query.limit);

  return {
    quizzes: paginated,
    pagination: {
      total: filtered.length,
      page: query.page,
      limit: query.limit,
      pages,
    },
    stats: {
      totalAssigned,
      participatedCount,
      scheduledCount,
      liveCount,
    },
  };
}

export async function getQuizDetails(quizId: string, candidateId: string) {
  const quiz = await Quiz.findOne({
    _id: quizId,
    'participants.userId': new Types.ObjectId(candidateId),
  });

  if (!quiz || quiz.status === 'Cancelled' || quiz.status === 'Draft') {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found or not assigned to you');
  }

  // Apply live-window check on pre-attempt details
  const now = new Date();
  const rStatus = getRealtimeStatus(quiz, now);

  if (rStatus === 'Scheduled' && now < quiz.startTime) {
    // Upcoming: details joinable inside window only.
  }

  return {
    id: quiz._id.toString(),
    title: quiz.title,
    description: quiz.description,
    duration: quiz.duration,
    startTime: quiz.startTime,
    endTime: quiz.endTime,
    questionCount: quiz.questions.length,
    status: rStatus,
  };
}

export async function startQuiz(quizId: string, candidateId: string) {
  const quiz = await Quiz.findOne({
    _id: quizId,
    'participants.userId': new Types.ObjectId(candidateId),
  });

  if (!quiz || quiz.status === 'Cancelled' || quiz.status === 'Draft') {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found or not assigned to you');
  }

  const now = new Date();
  const rStatus = getRealtimeStatus(quiz, now);

  if (rStatus !== 'Live') {
    throw new ApiError(403, 'QUIZ_NOT_LIVE', 'Quiz is not currently joinable.');
  }

  // Check if attempt already exists
  let attempt = await QuizAttempt.findOne({ quizId, candidateId });
  if (attempt) {
    if (['submitted', 'auto-submitted'].includes(attempt.status)) {
      throw new ApiError(409, 'ALREADY_SUBMITTED', 'You have already submitted this quiz attempt.');
    }
  } else {
    // Create new attempt
    attempt = await QuizAttempt.create({
      quizId: quiz._id,
      candidateId: new Types.ObjectId(candidateId),
      startedAt: now,
      status: 'started',
    });
  }

  // Expose questions WITHOUT correct answers
  const sanitizedQuestions = quiz.questions.map((q: any) => ({
    id: q._id.toString(),
    text: q.text,
    options: q.options.map((o: any) => ({ id: o.id, text: o.text })),
    type: q.type,
  }));

  return {
    attemptId: attempt._id.toString(),
    startedAt: attempt.startedAt,
    duration: quiz.duration,
    questions: sanitizedQuestions,
  };
}

export async function submitQuiz(quizId: string, candidateId: string, answersInput: ICandidateAnswer[]) {
  const quiz = await Quiz.findOne({
    _id: quizId,
    'participants.userId': new Types.ObjectId(candidateId),
  });

  if (!quiz) {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
  }

  let attempt = await QuizAttempt.findOne({ quizId, candidateId });
  if (!attempt) {
    throw new ApiError(400, 'ATTEMPT_NOT_STARTED', 'Test session has not been initialized');
  }

  // Idempotency check: if already submitted, return the existing attempt
  if (['submitted', 'auto-submitted'].includes(attempt.status)) {
    return attempt;
  }

  const now = new Date();
  const timeLimitMs = (quiz.duration * 60 * 1000) + 15000; // Quiz duration + 15 seconds grace period
  const elapsedMs = now.getTime() - attempt.startedAt.getTime();

  let finalStatus: 'submitted' | 'auto-submitted' = 'submitted';
  if (elapsedMs > timeLimitMs) {
    finalStatus = 'auto-submitted';
  }

  // Score computation
  let score = 0;
  const answerMap = new Map<string, string[]>();
  answersInput.forEach((ans) => {
    answerMap.set(ans.questionId, ans.selectedOptionIds);
  });

  quiz.questions.forEach((q: any) => {
    const qId = q._id.toString();
    const candidateSelected = answerMap.get(qId) || [];
    const correctOptions = q.correctOptionIds || [];

    // Check option match
    if (q.type === 'single-choice' || q.type === 'true/false') {
      if (candidateSelected.length === 1 && correctOptions.includes(candidateSelected[0])) {
        score++;
      }
    } else if (q.type === 'multi-select') {
      // Must match exactly, no extras, no missing
      const match =
        candidateSelected.length === correctOptions.length &&
        candidateSelected.every((opt) => correctOptions.includes(opt));
      if (match) {
        score++;
      }
    }
  });

  attempt.answers = answersInput;
  attempt.score = score;
  attempt.status = finalStatus;
  attempt.submittedAt = now;
  await attempt.save();

  return attempt;
}

export async function getQuizResult(quizId: string, candidateId: string) {
  const quiz = await Quiz.findOne({
    _id: quizId,
    'participants.userId': new Types.ObjectId(candidateId),
  });

  if (!quiz) {
    throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found or you are not assigned to it');
  }

  const attempt = await QuizAttempt.findOne({ quizId, candidateId });
  if (!attempt || attempt.status === 'started') {
    throw new ApiError(404, 'RESULT_NOT_FOUND', 'Result not available. Test is not yet submitted.');
  }

  // Calculate stats
  const totalQuestions = quiz.questions.length;
  const correctCount = attempt.score;
  const skippedCount = quiz.questions.filter((q: any) => {
    const ans = attempt.answers.find((a) => a.questionId === q._id.toString());
    return !ans || ans.selectedOptionIds.length === 0;
  }).length;
  const wrongCount = totalQuestions - correctCount - skippedCount;

  const timeTakenSeconds = Math.round(
    ((attempt.submittedAt ? attempt.submittedAt.getTime() : new Date().getTime()) - attempt.startedAt.getTime()) / 1000
  );

  // Map questions with results detail (expose correct option IDs!)
  const questionsDetail = quiz.questions.map((q: any) => {
    const ans = attempt.answers.find((a) => a.questionId === q._id.toString());
    const selected = ans ? ans.selectedOptionIds : [];
    return {
      id: q._id.toString(),
      text: q.text,
      options: q.options.map((o: any) => ({ id: o.id, text: o.text })),
      type: q.type,
      selectedOptionIds: selected,
      correctOptionIds: q.correctOptionIds,
      isCorrect:
        q.type === 'multi-select'
          ? selected.length === q.correctOptionIds.length && selected.every((s) => q.correctOptionIds.includes(s))
          : selected.length === 1 && q.correctOptionIds.includes(selected[0]),
    };
  });

  return {
    score: attempt.score,
    percentage: totalQuestions > 0 ? Math.round((attempt.score / totalQuestions) * 100) : 0,
    totalQuestions,
    correctCount,
    wrongCount,
    skippedCount,
    timeTakenSeconds,
    status: attempt.status,
    questions: questionsDetail,
  };
}
