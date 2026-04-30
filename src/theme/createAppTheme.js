import { alpha, createTheme } from '@mui/material/styles';

function getPalette(mode) {
  const isDark = mode === 'dark';

  return {
    mode,
    // MUI palette utilities (lighten/darken/contrastText) require concrete color values.
    primary: {
      main: isDark ? '#4a4540' : '#4a4540',
      light: isDark ? '#625b54' : '#6b6660',
      dark: isDark ? '#37322e' : '#2f2b27',
      contrastText: isDark ? '#f6f0eb' : '#ffffff',
    },
    secondary: {
      main: isDark ? '#8c7f73' : '#ede8e1',
      light: isDark ? '#a79a8f' : '#f4efea',
      dark: isDark ? '#6f645a' : '#d8d1c8',
      contrastText: isDark ? '#f7f2ed' : '#4a4540',
    },
    background: {
      default: isDark ? '#1a1715' : '#f6f1ee',
      paper: isDark ? '#26211d' : '#ffffff',
      /** Backplate behind the HireLink mark in the header (translates to PNG transparent areas). */
      headerLogo: isDark ? '#1a1615' : '#fff0eb',
    },
    text: {
      primary: isDark ? '#eee4db' : '#4a4540',
      secondary: isDark ? '#c5b6a7' : '#6b6660',
    },
    divider: isDark ? '#3d342d' : '#e8e4e0',
    ...(isDark && {
      action: {
        hover: alpha('#eee4db', 0.06),
        selected: alpha('#eee4db', 0.1),
        disabled: alpha('#eee4db', 0.38),
        disabledBackground: alpha('#eee4db', 0.12),
      },
    }),
  };
}

export default function createAppTheme(mode) {
  const isDark = mode === 'dark';
  const base = createTheme({
    direction: 'rtl',
    palette: getPalette(mode),
    typography: {
      fontFamily: 'var(--font-family-base)',
      h1: {
        fontSize: 'var(--font-size-h1)',
        fontWeight: 700,
        lineHeight: 'var(--line-height-tight)',
        fontFamily: 'var(--font-family-heading)',
      },
      h6: {
        fontSize: 'var(--font-size-h6)',
        fontWeight: 600,
        lineHeight: 'var(--line-height-tight)',
      },
      body1: {
        fontSize: 'var(--font-size-body)',
        lineHeight: 'var(--line-height-base)',
      },
      body2: {
        fontSize: 'var(--font-size-body-sm)',
        lineHeight: 'var(--line-height-relaxed)',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
        fontFamily: 'var(--font-family-base)',
      },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: ({ theme }) => ({
            margin: 0,
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: { minHeight: 64 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
            ...(isDark && {
              backgroundColor: theme.palette.background.paper,
              boxShadow: `0 8px 24px ${alpha('#000000', 0.26)}`,
            }),
          }),
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius-pill)',
            textTransform: 'none',
            fontWeight: 'var(--btn-font-weight)',
          },
          contained: ({ theme }) => ({
            backgroundColor: isDark ? theme.palette.primary.main : 'var(--btn-primary-bg)',
            color: isDark ? theme.palette.primary.contrastText : 'var(--btn-primary-text)',
            '&:hover': {
              backgroundColor: isDark ? theme.palette.primary.light : 'var(--btn-primary-hover-bg)',
            },
            '&.Mui-disabled': {
              backgroundColor: isDark ? theme.palette.action.disabledBackground : 'var(--btn-primary-disabled-bg)',
              color: isDark ? theme.palette.action.disabled : 'var(--btn-primary-disabled-text)',
            },
          }),
          outlined: ({ theme }) => ({
            borderColor: isDark ? alpha(theme.palette.primary.light, 0.56) : 'var(--btn-secondary-border)',
            color: isDark ? theme.palette.primary.light : 'var(--btn-secondary-text)',
            '&:hover': {
              borderColor: isDark ? alpha(theme.palette.primary.light, 0.82) : 'var(--btn-secondary-hover-border)',
              backgroundColor: isDark ? alpha(theme.palette.primary.light, 0.12) : 'var(--btn-secondary-hover-bg)',
            },
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 24,
            ...(isDark && {
              backgroundColor: alpha(theme.palette.background.paper, 0.92),
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              boxShadow: `0 10px 30px ${alpha('#000000', 0.3)}`,
            }),
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            ...(isDark && {
              backgroundColor: '#201b18',
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            }),
          }),
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'transparent' },
        styleOverrides: {
          root: ({ theme }) => ({
            ...(isDark && {
              backgroundColor: alpha(theme.palette.background.default, 0.8),
              backdropFilter: 'blur(6px)',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            }),
          }),
        },
      },
    },
  });

  const shadows = [...base.shadows];
  shadows[1] = 'var(--shadow-md)';

  return createTheme({ ...base, shadows });
}

