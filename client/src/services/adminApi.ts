// filename: client/src/services/adminApi.ts
import { baseApi } from './baseApi';
import type { User } from './authApi';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  status: 'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  instructor: string;
  questions: any[];
  participants: any[];
  cancellationTimestamp?: string;
  createdAt: string;
  updatedAt: string;
  questionsCount?: number;
  participantsCount?: number;
  isReady?: boolean;
}

export interface GetUsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    totalUsers: number;
    adminCount: number;
    instructorCount: number;
    candidateCount: number;
    activeCount: number;
    inactiveCount: number;
  };
}

export interface GetAnalyticsResponse {
  totalQuizzes: number;
  draftCount: number;
  scheduledCount: number;
  liveCount: number;
  completedCount: number;
  cancelledCount: number;
  totalParticipants: number;
  totalInstructors: number;
  averageAttemptRate: number;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponse, any>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['Users'],
    }),
    getAdminQuizzes: builder.query<{ quizzes: Quiz[]; pagination: any }, any>({
      query: (params) => ({
        url: '/admin/quizzes',
        params,
      }),
      providesTags: ['Quizzes'],
    }),
    upgradeUserToInstructor: builder.mutation<{ user: User; message: string }, { email: string }>({
      query: (body) => ({
        url: '/admin/users/assign-instructor',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    createQuiz: builder.mutation<{ quiz: Quiz }, any>({
      query: (quizData) => ({
        url: '/admin/quizzes',
        method: 'POST',
        body: quizData,
      }),
      invalidatesTags: ['Quizzes'],
    }),
    updateQuiz: builder.mutation<{ quiz: Quiz }, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/admin/quizzes/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    deleteQuiz: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quizzes'],
    }),
    cancelQuiz: builder.mutation<{ quiz: Quiz; message: string }, string>({
      query: (id) => ({
        url: `/admin/quizzes/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    assignInstructor: builder.mutation<{ quiz: Quiz; message: string }, { id: string; email: string }>({
      query: ({ id, email }) => ({
        url: `/admin/quizzes/${id}/assign-instructor`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    getAnalytics: builder.query<GetAnalyticsResponse, any>({
      query: (params) => ({
        url: '/admin/analytics',
        params,
      }),
      providesTags: ['Quizzes', 'Results'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetAdminQuizzesQuery,
  useUpgradeUserToInstructorMutation,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useCancelQuizMutation,
  useAssignInstructorMutation,
  useGetAnalyticsQuery,
} = adminApi;
