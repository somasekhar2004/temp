// filename: client/src/services/candidateApi.ts
import { baseApi } from './baseApi';

export interface CandidateQuiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  realStatus: 'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  candidateStatus: 'upcoming' | 'live' | 'completed' | 'expired';
  questionCount: number;
  attemptStatus: 'started' | 'submitted' | 'auto-submitted' | null;
}

export interface GetCandidateQuizzesResponse {
  quizzes: CandidateQuiz[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    totalAssigned: number;
    participatedCount: number;
    scheduledCount: number;
    liveCount: number;
  };
}

export interface StartQuizResponse {
  attemptId: string;
  startedAt: string;
  duration: number;
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    type: 'single-choice' | 'multi-select' | 'true/false';
  }[];
}

export interface QuizResultResponse {
  score: number;
  percentage: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTakenSeconds: number;
  status: 'started' | 'submitted' | 'auto-submitted';
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    type: 'single-choice' | 'multi-select' | 'true/false';
    selectedOptionIds: string[];
    correctOptionIds: string[];
    isCorrect: boolean;
  }[];
}

export const candidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCandidateQuizzes: builder.query<GetCandidateQuizzesResponse, any>({
      query: (params) => ({
        url: '/candidate/quizzes',
        params,
      }),
      providesTags: ['Quizzes', 'Attempt'],
    }),
    getCandidateQuizDetails: builder.query<{ quiz: any }, string>({
      query: (id) => `/candidate/quizzes/${id}`,
      providesTags: ['QuizDetails'],
    }),
    startCandidateQuiz: builder.mutation<StartQuizResponse, string>({
      query: (id) => ({
        url: `/candidate/quizzes/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['Quizzes', 'Attempt'],
    }),
    submitCandidateQuiz: builder.mutation<{ attempt: any; message: string }, { id: string; answers: any[] }>({
      query: ({ id, answers }) => ({
        url: `/candidate/quizzes/${id}/submit`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['Quizzes', 'Attempt', 'Results'],
    }),
    getCandidateQuizResult: builder.query<QuizResultResponse, string>({
      query: (id) => `/candidate/quizzes/${id}/result`,
      providesTags: ['Results'],
    }),
  }),
});

export const {
  useGetCandidateQuizzesQuery,
  useGetCandidateQuizDetailsQuery,
  useStartCandidateQuizMutation,
  useSubmitCandidateQuizMutation,
  useGetCandidateQuizResultQuery,
} = candidateApi;
