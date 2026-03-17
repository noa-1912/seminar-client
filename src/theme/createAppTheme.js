import { createTheme } from '@mui/material/styles';

function getPalette(mode) {
  if (mode === 'dark') {
    return {
      mode: 'dark',
      primary: { main: '#f5f5f5' },
      secondary: { main: '#2b2320' },
      background: { default: '#0f0f10', paper: '#151517' },
      text: { primary: '#f5f5f5', secondary: '#b0b0b0' },
    };
  }

  return {
    mode: 'light',
    primary: { main: '#111111' },
    secondary: { main: '#f3e8e3' },
    background: { default: '#f6f1ee', paper: '#ffffff' },
    text: { primary: '#111111', secondary: '#666666' },
  };
}

export default function createAppTheme(mode) {
  const base = createTheme({
    direction: 'rtl',
    palette: getPalette(mode),
    typography: {
      fontFamily: "'Inter', 'Poppins', 'Assistant', 'Heebo', sans-serif",
      h1: { fontSize: '36px', fontWeight: 700, lineHeight: 1.2 },
      body1: { fontSize: '16px' },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { margin: 0 },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'transparent' },
      },
      MuiToolbar: {
        styleOverrides: {
          root: { minHeight: 64 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 24 },
        },
      },
    },
  });

  const shadows = [...base.shadows];
  shadows[1] =
    mode === 'dark'
      ? '0 10px 30px rgba(0,0,0,0.35)'
      : '0 10px 30px rgba(0,0,0,0.05)';

  return createTheme({ ...base, shadows });
}

