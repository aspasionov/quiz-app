'use client';

import { createTheme, ThemeProvider, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';
import { MAIN_COLOR, SECOND_COLOR } from '@/constans';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: MAIN_COLOR,
      dark: '#5e35b1',
      light: '#b39ddb',
    },
    secondary: {
      main: SECOND_COLOR,
      dark: '#fbc02d',
      light: '#fff59d',
    },
  },
  typography: {
    fontFamily: 'var(--font-dynapuff), Arial, sans-serif',
  },
};

const theme = createTheme(themeOptions);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
