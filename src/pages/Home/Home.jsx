import { Stack, Typography } from '@mui/material';
import PageShell from '../../components/PageShell/PageShell';

export default function Home() {
  return (
    <PageShell>
      <Stack spacing={1}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          דף הבית
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ברוכים הבאים למערכת ההשמה לסמינר. תוכן העמוד יתווסף בהמשך.
        </Typography>
      </Stack>
    </PageShell>
  );
}
