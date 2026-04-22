import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { useThemeMode } from '../../theme/useThemeMode';
import PageShell from '../../components/PageShell/PageShell';

export default function Settings() {
  const { mode, setMode } = useThemeMode();

  return (
    <PageShell>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          הגדרות
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
              inputProps={{ 'aria-label': 'מצב כהה' }}
            />
          }
          label={
            <Typography variant="body1">מצב תצוגה: {mode === 'dark' ? 'כהה' : 'בהיר'}</Typography>
          }
        />
      </Stack>
    </PageShell>
  );
}

