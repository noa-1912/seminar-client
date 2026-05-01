import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box } from '@mui/material';

import PageShell from '../../PageShell/PageShell';
import InterviewSlotsPanel from './InterviewSlotsPanel.jsx';

export default function InterviewSlotsList() {
  const { jobId: jobIdParam } = useParams();

  const jobId = useMemo(() => {
    const parsed = Number(jobIdParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [jobIdParam]);

  return (
    <PageShell>
      {!jobId ? (
        <Box sx={{ maxWidth: 960, mx: 'auto' }}>
          <Alert severity="error">לא נמצא מזהה משרה תקין בכתובת.</Alert>
        </Box>
      ) : (
        <InterviewSlotsPanel jobId={jobId} variant="standalone" />
      )}
    </PageShell>
  );
}
