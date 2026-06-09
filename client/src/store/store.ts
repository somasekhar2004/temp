// filename: client/src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../services/baseApi';
import authReducer from './authSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
