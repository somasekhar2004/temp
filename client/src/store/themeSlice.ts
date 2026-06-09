// filename: client/src/store/themeSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  }
  
  // Optional: check system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = systemPrefersDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', initial);
  return initial;
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = nextTheme;
      localStorage.setItem('theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
