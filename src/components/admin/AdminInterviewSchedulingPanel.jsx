import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import InterviewSlotsPanel from '../team5/interviews/InterviewSlotsPanel.jsx';
import { getManagementJobs } from './adminService';

export default function AdminInterviewSchedulingPanel() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await getManagementJobs();
      setJobs(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e?.message || 'לא ניתן לטעון את רשימת המשרות.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const jobIdNum = selectedJobId ? Number(selectedJobId) : null;
  const validJobId = Number.isFinite(jobIdNum) && jobIdNum > 0 ? jobIdNum : null;

  return (
    <Box className="jobs-admin__management">
      <Typography variant="h6" className="jobs-admin__management-title" sx={{ mb: 1.5 }}>
        תזמון ראיונות
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        בחרו משרה כדי לראות זמני ראיון, לחפש מועמדות זמינות לפי שעה ולשבץ לראיון.
      </Typography>

      {error ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Stack alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Stack>
      ) : (
        <FormControl fullWidth size="small" sx={{ maxWidth: 420, mb: 2 }}>
          <InputLabel id="admin-interview-job-label">משרה</InputLabel>
          <Select
            labelId="admin-interview-job-label"
            label="משרה"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>בחרו משרה</em>
            </MenuItem>
            {jobs.map((row) => (
              <MenuItem key={row.id} value={String(row.id)}>
                {row.title} · {row.company}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {validJobId ? <InterviewSlotsPanel jobId={validJobId} variant="embedded" /> : null}
    </Box>
  );
}
