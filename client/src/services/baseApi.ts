// filename: client/src/services/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Quizzes', 'Users', 'QuizDetails', 'Attempt', 'Results'],
  endpoints: () => ({}),
});
