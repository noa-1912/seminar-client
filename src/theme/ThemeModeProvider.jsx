import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import createAppTheme from './createAppTheme';
import { ThemeModeContext } from './themeModeContext';

function getInitialMode() {
  try {
    const saved = window.localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Ignore storage access errors and use system/default mode.
  }

  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem('themeMode', mode);
    } catch {
      // Ignore storage access errors.
    }
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, toggleMode]);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

