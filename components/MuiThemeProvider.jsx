'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import EmotionCacheProvider from '@/components/EmotionCacheProvider';

// ─── Theme ────────────────────────────────────────────────────────────────────
// Matches the minimal-ui-kit color palette and typography exactly.

const theme = createTheme({
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontFamily: '"Barlow", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Barlow", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Barlow", sans-serif', fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem' },
    overline: { fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' },
    button: { fontWeight: 700, textTransform: 'unset' },
  },
  palette: {
    primary: {
      lighter: '#D0ECFE',
      light: '#73BAFB',
      main: '#1877F2',
      dark: '#0C44AE',
      darker: '#042174',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#EFD6FF',
      light: '#C684FF',
      main: '#8E33FF',
      dark: '#5119B7',
      darker: '#27097A',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#CAFDF5',
      light: '#61F3F3',
      main: '#00B8D9',
      dark: '#006C9C',
      darker: '#003768',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#D3FCD2',
      light: '#77ED8B',
      main: '#22C55E',
      dark: '#118D57',
      darker: '#065E49',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FFE9D5',
      light: '#FFAC82',
      main: '#FF5630',
      dark: '#B71D18',
      darker: '#7A0916',
      contrastText: '#FFFFFF',
    },
    grey: {
      50: '#FCFDFD',
      100: '#F9FAFB',
      200: '#F4F6F8',
      300: '#DFE3E8',
      400: '#C4CDD5',
      500: '#919EAB',
      600: '#637381',
      700: '#454F5B',
      800: '#1C252E',
      900: '#141A21',
    },
    text: {
      primary: '#1C252E',
      secondary: '#637381',
      disabled: '#919EAB',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    divider: 'rgba(145, 158, 171, 0.2)',
    action: {
      hover: 'rgba(145, 158, 171, 0.08)',
      selected: 'rgba(145, 158, 171, 0.16)',
      focus: 'rgba(145, 158, 171, 0.24)',
      disabled: 'rgba(145, 158, 171, 0.8)',
      disabledBackground: 'rgba(145, 158, 171, 0.24)',
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 2px 0 rgba(145,158,171,0.08), 0 12px 24px -4px rgba(145,158,171,0.08)',
          borderRadius: 16,
        },
      },
    },
  },
});

// ─── Provider ────────────────────────────────────────────────────────────────

export default function MuiThemeProvider({ children }) {
  return (
    <EmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  );
}
