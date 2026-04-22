import { Stack, Typography } from '@mui/material';
import PageShell from '../../components/PageShell/PageShell';

export default function Jobs() {
  return (
    <PageShell>
      <Stack spacing={1}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          משרות
        </Typography>
        <Typography variant="body1" color="text.secondary">
          תוכן העמוד יתווסף בהמשך.
        </Typography>
      </Stack>
    </PageShell>
  );
}

