import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: colors.grayMedium,
      light: colors.grayLight,
      dark: colors.grayDark,
    },
    secondary: {
      main: colors.lightPink,
      light: colors.lightPinkAlt,
    },
    background: {
      default: colors.white,
      paper: colors.warmBeige,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
  },
  typography: {
    fontFamily: '"Assistant", "Heebo", "Segoe UI", sans-serif',
    h6: { fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
});

export default theme;
export { colors };
