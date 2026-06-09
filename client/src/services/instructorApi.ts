// filename: client/src/services/instructorApi.ts
import { baseApi } from './baseApi';
import type { Quiz } from './adminApi';

export interface GetInstructorQuizzesResponse {
  quizzes: Quiz[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface GetQuizResultsResponse {
  attempts: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    totalParticipants: number;
    totalSubmitted: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    distribution: {
      excelCount: number;
      highCount: number;
      midCount: number;
      lowCount: number;
      failCount: number;
    };
  };
}

export const instructorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstructorQuizzes: builder.query<GetInstructorQuizzesResponse, any>({
      query: (params) => ({
        url: '/instructor/quizzes',
        params,
      }),
      providesTags: ['Quizzes'],
    }),
    updateInstructorQuiz: builder.mutation<{ quiz: Quiz; message: string }, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/instructor/quizzes/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    addQuestion: builder.mutation<{ quiz: Quiz; message: string }, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/instructor/quizzes/${id}/questions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    editQuestion: builder.mutation<{ quiz: Quiz; message: string }, { id: string; qId: string; body: any }>({
      query: ({ id, qId, body }) => ({
        url: `/instructor/quizzes/${id}/questions/${qId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    deleteQuestion: builder.mutation<{ quiz: Quiz; message: string }, { id: string; qId: string }>({
      query: ({ id, qId }) => ({
        url: `/instructor/quizzes/${id}/questions/${qId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    addParticipant: builder.mutation<{ quiz: Quiz; message: string }, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/instructor/quizzes/${id}/participants`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    removeParticipant: builder.mutation<{ quiz: Quiz; message: string }, { id: string; pId: string }>({
      query: ({ id, pId }) => ({
        url: `/instructor/quizzes/${id}/participants/${pId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    publishQuiz: builder.mutation<{ quiz: Quiz; message: string }, string>({
      query: (id) => ({
        url: `/instructor/quizzes/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    cancelInstructorQuiz: builder.mutation<{ quiz: Quiz; message: string }, string>({
      query: (id) => ({
        url: `/instructor/quizzes/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Quizzes', 'QuizDetails'],
    }),
    deleteInstructorQuiz: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/instructor/quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quizzes'],
    }),
    getQuizResults: builder.query<GetQuizResultsResponse, { id: string; params: any }>({
      query: ({ id, params }) => ({
        url: `/instructor/quizzes/${id}/results`,
        params,
      }),
      providesTags: ['Results'],
    }),
  }),
});

export const {
  useGetInstructorQuizzesQuery,
  useUpdateInstructorQuizMutation,
  useAddQuestionMutation,
  useEditQuestionMutation,
  useDeleteQuestionMutation,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
  usePublishQuizMutation,
  useCancelInstructorQuizMutation,
  useDeleteInstructorQuizMutation,
  useGetQuizResultsQuery,
} = instructorApi;
