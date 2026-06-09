// filename: client/src/services/authApi.ts
import { baseApi } from './baseApi';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'participant';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    signup: builder.mutation<AuthResponse, any>({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Quizzes', 'Users', 'QuizDetails', 'Attempt', 'Results'],
    }),
    me: builder.query<AuthResponse, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useMeQuery,
} = authApi;
